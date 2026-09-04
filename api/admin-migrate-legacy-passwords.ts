import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore, getFirebaseAdminAuth } from './_lib/firebaseAdmin.js';

// ---------------------------------------------------------------------------
// POST /api/admin-migrate-legacy-passwords
//
// Correção pontual, para rodar UMA VEZ: contas criadas antes da migração
// para Firebase Authentication ainda têm um campo `password` em texto puro
// salvo no documento do Firestore (visível publicamente, já que /users/{id}
// é de leitura pública por necessidade do app). Este endpoint:
//   1. Lê (com o Admin SDK, sem passar pelas regras) todos os documentos de
//      `users` que ainda têm esse campo.
//   2. Cria a conta real no Firebase Authentication usando o MESMO e-mail e
//      a MESMA senha, e com o MESMO id do documento como UID — assim o login
//      continua funcionando exatamente igual para o usuário, e o documento
//      já bate com as regras de segurança (`isOwner`) sem precisar mudar
//      nenhuma referência (posts, amigos, chats, etc.) em outros lugares.
//   3. Apaga o campo `password` do Firestore.
//
// Protegido por um segredo (MIGRATION_SECRET) em vez de exigir login de
// admin, porque a própria conta 'admin' pode estar entre as que precisam
// ser migradas (problema do "ovo e da galinha").
//
// SEGURO RODAR MAIS DE UMA VEZ: contas já migradas (sem campo `password`)
// são simplesmente ignoradas.
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Use POST.' });
  }

  const secret = req.headers['x-migration-secret'];
  if (!process.env.MIGRATION_SECRET || secret !== process.env.MIGRATION_SECRET) {
    return res.status(403).json({ success: false, message: 'Segredo de migração inválido ou não configurado.' });
  }

  try {
    const db = getFirebaseAdminFirestore();
    const auth = getFirebaseAdminAuth();

    const snapshot = await db.collection('users').get();

    const migrated: string[] = [];
    const alreadyOk: string[] = [];
    const conflicts: { id: string; reason: string }[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const userId = docSnap.id;

      if (!('password' in data) || !data.password) {
        continue; // já migrada ou nunca teve senha em texto puro
      }

      if (!data.email) {
        conflicts.push({ id: userId, reason: 'Documento sem e-mail associado; não é possível migrar.' });
        continue;
      }

      try {
        await auth.createUser({
          uid: userId,
          email: data.email,
          password: String(data.password),
          displayName: data.fullName || undefined,
        });
        migrated.push(userId);
      } catch (err: any) {
        if (err.code === 'auth/uid-already-exists') {
          // Já existe conta com esse UID (provavelmente já migrada antes) — só limpa o campo.
          alreadyOk.push(userId);
        } else if (err.code === 'auth/email-already-exists') {
          // Já existe uma conta real no Firebase Authentication para este
          // e-mail, só que com um UID diferente do id deste documento
          // (geralmente porque a pessoa já tentou logar/cadastrar pelo fluxo
          // novo antes desta migração rodar). A prioridade de segurança é
          // remover a senha em texto puro AGORA — então apagamos o campo
          // mesmo sem criar/vincular uma nova conta — e sinalizamos o caso
          // para revisão manual, já que essa pessoa pode estar com
          // dificuldade para logar até isso ser resolvido à parte.
          conflicts.push({ id: userId, reason: `O e-mail ${data.email} já está associado a outra conta no Firebase Authentication (UID diferente deste documento). Senha em texto puro removida por segurança, mas o vínculo de login desta conta requer revisão manual separada.` });
        } else if (err.code === 'auth/invalid-password') {
          conflicts.push({ id: userId, reason: 'Senha salva não atende ao mínimo de 6 caracteres exigido pelo Firebase Authentication. Requer redefinição manual.' });
          continue;
        } else {
          conflicts.push({ id: userId, reason: err.message || 'Erro desconhecido ao criar a conta.' });
          continue;
        }
      }

      await db.collection('users').doc(userId).update({ password: FieldValue.delete() });
    }

    return res.status(200).json({
      success: true,
      summary: {
        migradas: migrated,
        jaEstavamOk: alreadyOk,
        conflitos: conflicts,
        totalVerificado: snapshot.size,
      },
    });
  } catch (error: any) {
    console.error('Erro em /api/admin-migrate-legacy-passwords:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Erro interno na migração.' });
  }
}
