import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Preference } from 'mercadopago';
import { getMercadoPagoClient, CREDIT_PACKAGES } from './_lib/mercadopago';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId, packageId } = req.body ?? {};
    if (!userId || !packageId) {
      return res.status(400).json({ success: false, error: 'userId e packageId são obrigatórios.' });
    }
    const amount = CREDIT_PACKAGES[packageId];
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Pacote de créditos inválido.' });
    }

    const client = getMercadoPagoClient();
    const preference = new Preference(client);

    const baseUrl = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`;

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
          excluded_payment_types: [{ id: 'ticket' }],
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

    res.status(200).json({
      success: true,
      checkoutUrl: process.env.MERCADOPAGO_ENV === 'production' ? result.init_point : result.sandbox_init_point,
      preferenceId: result.id,
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento Mercado Pago:', error?.message || error);
    res.status(500).json({ success: false, error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
  }
}
