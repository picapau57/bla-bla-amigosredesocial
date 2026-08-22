import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return res.status(500).json({ success: false, error: 'Agora não configurado no servidor.' });
    }

    const { channelName, uid, role } = req.body ?? {};
    if (!channelName || uid === undefined || uid === null) {
      return res.status(400).json({ success: false, error: 'channelName e uid são obrigatórios.' });
    }

    // "broadcaster" = quem está transmitindo (pode publicar vídeo/áudio)
    // "audience" = quem está assistindo (só recebe)
    const rtcRole = role === 'broadcaster' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expireSeconds = 3600; // token válido por 1 hora
    const tokenExpireTs = nowInSeconds + expireSeconds;
    const privilegeExpireTs = nowInSeconds + expireSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      Number(uid),
      rtcRole,
      tokenExpireTs,
      privilegeExpireTs
    );

    res.status(200).json({ success: true, token, appId });
  } catch (error: any) {
    console.error('Erro ao gerar token do Agora:', error?.message || error);
    res.status(500).json({ success: false, error: 'Não foi possível gerar o token de acesso à live.' });
  }
}
