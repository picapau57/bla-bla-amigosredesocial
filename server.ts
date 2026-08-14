import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // Initialize Gemini AI SDK (lazy check for key)
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Real-time Content Moderation API
  app.post('/api/moderate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Safe bypass if key not configured
        return res.json({ success: true, isRestricted: false });
      }

      const { text, mediaUrl, mediaType } = req.body;
      const ai = getGeminiClient();

      const systemInstruction = `Você é um moderador automatizado em tempo real da rede social 'Bla Bla Amigos'. 
Sua tarefa é analisar postagens para detectar violações graves de termos como pornografia, ódio explícito, golpes ou pirataria nociva.
Vídeos normais do YouTube, Reels, músicas compartilhadas ou fotos normais NÃO violam direitos e devem ser aceitos livremente.`;

      const prompt = `Analise a seguinte publicação:
Legenda/Texto: "${text || ''}"
Mídia Associada (URL): "${mediaUrl || 'Nenhuma mídia anexada'}"
Tipo de Mídia: "${mediaType || 'Nenhum'}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isRestricted: {
                type: Type.BOOLEAN,
                description: 'true se houver violação grave e inaceitável, false para conteúdo normal/cotidiano.',
              },
              reason: {
                type: Type.STRING,
                description: 'Explicação do motivo da restrição caso isRestricted seja true.',
              },
            },
            required: ['isRestricted', 'reason'],
          },
        },
      });

      const resultText = response.text || '{}';
      const resultJson = JSON.parse(resultText.trim());

      res.json({
        success: true,
        isRestricted: !!resultJson.isRestricted,
        reason: resultJson.reason || '',
      });
    } catch (error: any) {
      console.warn('Content moderation bypassed safely:', error?.message);
      res.json({
        success: true,
        isRestricted: false,
        error: error?.message || 'Bypassed',
      });
    }
  });

  // Healthcheck Route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Setup Vite Dev server / Production Static Assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bla Bla Amigos Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
