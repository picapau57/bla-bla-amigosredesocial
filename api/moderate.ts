import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Bypass seguro se a chave não estiver configurada
      return res.status(200).json({ success: true, isRestricted: false });
    }

    const { text, mediaUrl, mediaType } = req.body ?? {};
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

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

    res.status(200).json({
      success: true,
      isRestricted: !!resultJson.isRestricted,
      reason: resultJson.reason || '',
    });
  } catch (error: any) {
    console.warn('Content moderation bypassed safely:', error?.message);
    res.status(200).json({
      success: true,
      isRestricted: false,
      error: error?.message || 'Bypassed',
    });
  }
}
