import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore, getFirebaseAdminAuth } from '../_lib/firebaseAdmin';

// POST /api/admin/reset-password
// Permite que o administrador redefina a senha de outro usuário sem nunca
// ler ou exibir a senha atual (não existe mais em texto puro). Exige o
// token de sessão real do admin (Firebase Authentication), verificado no
// servidor — nunca confia em nada vindo do cliente sobre "quem é admin".
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Use POST.' });
  }

  try {
    const idToken = (req.headers.authorization || '').replace('Bearer ', '');
    if (!idToken) {
      return res.status(401).json({ success: false, message: 'Sessão não autenticada.' });
    }

    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken).catch(() => null);
    if (!decoded || decoded.uid !== 'admin') {
      return res.status(403).json({ success: false, message: 'Apenas o administrador pode redefinir senhas de outros usuários.' });
    }

    const { targetUserId, newPassword } = req.body || {};
    if (!targetUserId || !newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Informe o usuário e uma nova senha com pelo menos 6 caracteres.' });
    }

    const db = getFirebaseAdminFirestore();
    const targetDocRef = db.collection('users').doc(targetUserId);
    const targetDoc = await targetDocRef.get();
    if (!targetDoc.exists) {
      return res.status(404).json({ success: false, message: 'Usuário alvo não encontrado.' });
    }
    const targetData = targetDoc.data()!;

    try {
      await auth.updateUser(targetUserId, { password: String(newPassword) });
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Ainda não tinha conta real no Firebase Auth (não deveria acontecer
        // após a migração, mas cobrimos o caso por segurança).
        await auth.createUser({ uid: targetUserId, email: targetData.email, password: String(newPassword) });
      } else {
        throw err;
      }
    }

    // Defesa extra: garante que nenhum campo de senha em texto puro sobre no documento.
    await targetDocRef.update({ password: FieldValue.delete() }).catch(() => {});

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Erro em /api/admin/reset-password:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Erro interno ao redefinir a senha.' });
  }
}
