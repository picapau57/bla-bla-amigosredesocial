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
      const { text, mediaUrl, mediaType } = req.body;
      const ai = getGeminiClient();

      const systemInstruction = `Você é um moderador automatizado em tempo real da rede social 'Bla Bla Amigos'. 
Sua tarefa é analisar postagens (textos, links de vídeos, fotos) para detectar violações de direitos autorais (copyright), marcas registradas protegidas (trademark) ou pirataria explícita de conteúdo de terceiros (como filmes comerciais completos, músicas proprietárias de gravadoras sem autorização, personagens protegidos como Disney, Marvel ou Nintendo sendo explorados comercialmente de forma abusiva, ou pirataria).
Você também deve marcar como restrito qualquer conteúdo nocivo, ofensivo, pornográfico ou de ódio.

Regras importantes:
1. Memes comuns ou referências leves não violam direitos autorais. Mas áudio de músicas protegidas completas, filmes piratas, ou download de software pirata sim.
2. Analise também o link enviado (mediaUrl) se houver, e a legenda (text).
3. Seja razoável, mas firme contra pirataria evidente ou cópia direta não autorizada de propriedade intelectual restrita.`;

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
                description: 'true se houver violação de direito autoral/marca registrada ou infração grave de regras, false caso contrário.',
              },
              reason: {
                type: Type.STRING,
                description: 'Explicação simples e educada em português do motivo da restrição (ex: "Violação de direitos autorais por conter link suspeito de pirataria").',
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
      console.error('Error during content moderation:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno durante a moderação em tempo real.',
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
