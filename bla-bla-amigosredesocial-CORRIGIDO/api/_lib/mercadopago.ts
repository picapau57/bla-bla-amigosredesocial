import { MercadoPagoConfig } from 'mercadopago';

export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables.');
  }
  return new MercadoPagoConfig({ accessToken });
}

// Pacotes fixos de crédito (mantidos no servidor para evitar manipulação de valor pelo cliente)
export const CREDIT_PACKAGES: Record<string, number> = {
  pkg_10: 10,
  pkg_25: 25,
  pkg_50: 50,
  pkg_100: 100,
};
