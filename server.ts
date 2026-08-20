import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- Firebase Admin SDK setup (server-side only, uses a Service Account) ---
// FIREBASE_SERVICE_ACCOUNT should contain the full JSON content of the service account key,
// set as a single-line environment variable in Vercel (never committed to the repo).
// Same Firestore database ID used by the client app (src/lib/firebase.ts)
const FIRESTORE_DB_ID = 'ai-studio-84899bc3-e76b-467e-8f0d-8498c43bf9e0';

let firebaseAdminApp: App | null = null;
function getFirebaseAdminFirestore() {
  if (!firebaseAdminApp) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined in environment variables.');
    }
    const serviceAccount = JSON.parse(raw);
    firebaseAdminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getFirestore(firebaseAdminApp, FIRESTORE_DB_ID);
}

// --- Mercado Pago SDK setup (server-side only) ---
function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables.');
  }
  return new MercadoPagoConfig({ accessToken });
}

// Fixed credit packages available for purchase (kept server-side so amounts can't be tampered with)
const CREDIT_PACKAGES: Record<string, number> = {
  pkg_10: 10,
  pkg_25: 25,
  pkg_50: 50,
  pkg_100: 100,
};

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

  // --- MERCADO PAGO: Create a payment preference (Checkout Pro) for a credit package ---
  app.post('/api/create-payment', async (req, res) => {
    try {
      const { userId, packageId } = req.body;
      if (!userId || !packageId) {
        return res.status(400).json({ success: false, error: 'userId e packageId são obrigatórios.' });
      }
      const amount = CREDIT_PACKAGES[packageId];
      if (!amount) {
        return res.status(400).json({ success: false, error: 'Pacote de créditos inválido.' });
      }

      const client = getMercadoPagoClient();
      const preference = new Preference(client);

      const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

      const result = await preference.create({
        body: {
          items: [
            {
              id: packageId,
              title: `Créditos Bla Bla Amigos - R$ ${amount.toFixed(2)}`,
              quantity: 1,
              unit_price: amount,
              currency_id: 'BRL',
            },
          ],
          payment_methods: {
            excluded_payment_types: [{ id: 'ticket' }], // Pix + Cartão only, no boleto
          },
          external_reference: JSON.stringify({ userId, packageId, amount }),
          back_urls: {
            success: `${baseUrl}/?wallet_payment=success`,
            pending: `${baseUrl}/?wallet_payment=pending`,
            failure: `${baseUrl}/?wallet_payment=failure`,
          },
          auto_return: 'approved',
          notification_url: `${baseUrl}/api/mercadopago-webhook`,
        },
      });

      res.json({
        success: true,
        checkoutUrl: process.env.MERCADOPAGO_ENV === 'production' ? result.init_point : result.sandbox_init_point,
        preferenceId: result.id,
      });
    } catch (error: any) {
      console.error('Erro ao criar pagamento Mercado Pago:', error?.message || error);
      res.status(500).json({ success: false, error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
    }
  });

  // --- MERCADO PAGO: Webhook - confirms payment and credits the user's wallet server-side ---
  app.post('/api/mercadopago-webhook', async (req, res) => {
    // Always respond 200 quickly so Mercado Pago doesn't keep retrying; we do the real work async-safe below.
    try {
      const topic = req.query.type || req.body?.type;
      const paymentId = req.query['data.id'] || req.body?.data?.id;

      if (topic !== 'payment' || !paymentId) {
        return res.status(200).json({ received: true });
      }

      const client = getMercadoPagoClient();
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: paymentId as string });

      if (payment.status !== 'approved') {
        return res.status(200).json({ received: true, status: payment.status });
      }

      const externalRef = payment.external_reference;
      if (!externalRef) {
        return res.status(200).json({ received: true, note: 'missing external_reference' });
      }
      const { userId, amount } = JSON.parse(externalRef);
      if (!userId || !amount) {
        return res.status(200).json({ received: true, note: 'invalid external_reference' });
      }

      const firestore = getFirebaseAdminFirestore();

      // Idempotency: skip if this exact Mercado Pago payment was already processed
      const processedRef = firestore
        .collection('processed_payments')
        .doc(String(paymentId));
      const processedSnap = await processedRef.get();
      if (processedSnap.exists) {
        return res.status(200).json({ received: true, note: 'already processed' });
      }

      const userRef = firestore.collection('users').doc(userId);
      await firestore.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) throw new Error('Usuário não encontrado');
        const currentCredits = userSnap.data()?.adCredits ?? 100;
        tx.update(userRef, { adCredits: currentCredits + amount });
        tx.set(processedRef, {
          userId,
          amount,
          paymentId: String(paymentId),
          processedAt: new Date().toISOString(),
        });
      });

      res.status(200).json({ received: true, credited: amount });
    } catch (error: any) {
      console.error('Erro ao processar webhook Mercado Pago:', error?.message || error);
      // Still return 200 to avoid endless retries storming the endpoint; the error is logged for investigation.
      res.status(200).json({ received: true, error: true });
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
