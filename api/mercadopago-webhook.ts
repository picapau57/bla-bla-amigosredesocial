import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Payment } from 'mercadopago';
import { getMercadoPagoClient } from './_lib/mercadopago.js';
import { getFirebaseAdminFirestore } from './_lib/firebaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sempre responde 200 rápido para o Mercado Pago não ficar reenviando.
  if (req.method !== 'POST') {
    return res.status(200).json({ received: true });
  }

  try {
    const topic = req.query.type || (req.body as any)?.type;
    const paymentId = req.query['data.id'] || (req.body as any)?.data?.id;

    if (topic !== 'payment' || !paymentId) {
      return res.status(200).json({ received: true });
    }

        const client = getMercadoPagoClient();
    const paymentClient = new Payment(client);

    // Tenta buscar o pagamento algumas vezes: o Mercado Pago às vezes avisa
    // o webhook um pouco antes do pagamento ficar disponível para consulta.
    let payment: Awaited<ReturnType<typeof paymentClient.get>> | null = null;
    let lastError: any = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        payment = await paymentClient.get({ id: paymentId as string });
        break;
      } catch (err) {
        lastError = err;
        if (attempt < 4) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    if (!payment) {
      throw lastError || new Error('Payment not found after retries');
    }

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

    // Idempotência: evita creditar duas vezes o mesmo pagamento do Mercado Pago
    const processedRef = firestore.collection('processed_payments').doc(String(paymentId));
    const processedSnap = await processedRef.get();
    if (processedSnap.exists) {
      return res.status(200).json({ received: true, note: 'already processed' });
    }

    const userRef = firestore.collection('users').doc(userId);
    await firestore.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error('Usuário não encontrado');
      // CORRIGIDO: o fallback era "?? 100", inventando R$100 de saldo para
      // qualquer usuário sem o campo adCredits definido. Nunca inventar saldo.
      const currentCredits = userSnap.data()?.adCredits ?? 0;
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
    res.status(200).json({ received: true, error: true });
  }
}
