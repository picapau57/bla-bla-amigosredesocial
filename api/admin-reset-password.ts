import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirebaseAdminFirestore, getFirebaseAdminAuth } from './_lib/firebaseAdmin.js';

// ---------------------------------------------------------------------------
// POST /api/admin-fix-account-id
//
// Corrige contas que já têm uma conta real no Firebase Authentication (com
// um UID gerado automaticamente), mas cujo perfil no Firestore ainda está
// salvo sob um ID antigo (ex: "user-1730000000000"). Isso acontece com
// contas criadas antes da migração para autenticação real, e faz a pessoa
// não conseguir logar (o app autentica com sucesso, mas não acha o perfil).
//
// O que este endpoint faz, para o userId antigo informado:
//   1. Descobre o UID real da conta no Firebase Authentication (pelo e-mail).
//   2. Copia o documento de perfil para um novo documento com esse UID.
//   3. Atualiza a referência dessa pessoa em TODAS as coleções que a citam
//      (posts, comentários, curtidas, amigos, chats, mensagens, solicitações
//      de amizade, comunidades, eventos, stories, páginas, vagas, ideias,
//      lives, reels).
//   4. Apaga o documento antigo.
//
// SEGURANÇA: por padrão roda em modo "dryRun" (não muda nada, só mostra o
// que seria alterado). Só aplica de verdade se o corpo da requisição tiver
// "dryRun": false explicitamente.
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Use POST.' });
  }

  const secret = req.headers['x-migration-secret'];
  if (!process.env.MIGRATION_SECRET || secret !== process.env.MIGRATION_SECRET) {
    return res.status(403).json({ success: false, message: 'Segredo de migração inválido ou não configurado.' });
  }

  const { oldUserId, dryRun } = req.body || {};
  const isDryRun = dryRun !== false; // padrão: true (simulação)

  if (!oldUserId) {
    return res.status(400).json({ success: false, message: 'Informe "oldUserId".' });
  }

  try {
    const db = getFirebaseAdminFirestore();
    const auth = getFirebaseAdminAuth();

    const oldDocRef = db.collection('users').doc(oldUserId);
    const oldDoc = await oldDocRef.get();
    if (!oldDoc.exists) {
      return res.status(404).json({ success: false, message: `Documento users/${oldUserId} não encontrado.` });
    }
    const oldData = oldDoc.data()!;
    if (!oldData.email) {
      return res.status(400).json({ success: false, message: 'Este documento não tem e-mail associado.' });
    }

    const authUser = await auth.getUserByEmail(oldData.email).catch(() => null);
    if (!authUser) {
      return res.status(404).json({ success: false, message: `Nenhuma conta no Firebase Authentication encontrada para ${oldData.email}.` });
    }
    const newUserId = authUser.uid;

    if (newUserId === oldUserId) {
      return res.status(200).json({ success: true, message: 'Este documento já está com o ID correto. Nada a fazer.' });
    }

    const newDocCheck = await db.collection('users').doc(newUserId).get();
    if (newDocCheck.exists) {
      return res.status(409).json({ success: false, message: `Já existe um documento em users/${newUserId}. Requer revisão manual para não sobrescrever dados.` });
    }

    const changes: { collection: string; docId: string; field: string; action: string }[] = [];
    const batch = db.batch();

    function replaceInArray(arr: any[] | undefined): { changed: boolean; result: string[] } {
      if (!Array.isArray(arr)) return { changed: false, result: [] };
      const idx = arr.indexOf(oldUserId);
      if (idx === -1) return { changed: false, result: arr };
      const result = [...arr];
      result[idx] = newUserId;
      return { changed: true, result };
    }

    // --- 1. Perfil: copia para o novo id, remove o antigo ---
    changes.push({ collection: 'users', docId: oldUserId, field: '(documento inteiro)', action: `mover para users/${newUserId}` });
    if (!isDryRun) {
      batch.set(db.collection('users').doc(newUserId), { ...oldData, id: newUserId });
      batch.delete(oldDocRef);
    }

    // --- 2. Outros usuários: friends / followers / following ---
    const usersSnap = await db.collection('users').get();
    for (const u of usersSnap.docs) {
      if (u.id === oldUserId) continue;
      const d = u.data();
      const updates: Record<string, string[]> = {};
      for (const field of ['friends', 'followers', 'following']) {
        const { changed, result } = replaceInArray(d[field]);
        if (changed) {
          updates[field] = result;
          changes.push({ collection: 'users', docId: u.id, field, action: 'substituir id na lista' });
        }
      }
      if (!isDryRun && Object.keys(updates).length > 0) {
        batch.update(u.ref, updates);
      }
    }

    // --- 3. Coleções com userId simples (autor) ---
    const simpleUserIdCollections = ['posts', 'stories', 'business_pages', 'community_posts', 'jobs', 'ideas', 'lives', 'live_messages', 'reels', 'ads'];
    for (const col of simpleUserIdCollections) {
      const snap = await db.collection(col).where('userId', '==', oldUserId).get();
      for (const d of snap.docs) {
        changes.push({ collection: col, docId: d.id, field: 'userId', action: 'substituir id' });
        if (!isDryRun) batch.update(d.ref, { userId: newUserId });
      }
    }

    // --- 4. Posts: reactions (likes/loves/applauds) e comments[].userId ---
    const postsSnap = await db.collection('posts').get();
    for (const p of postsSnap.docs) {
      const d = p.data();
      const updates: Record<string, any> = {};
      for (const field of ['reactions.likes', 'reactions.loves', 'reactions.applauds']) {
        const [parent, child] = field.split('.');
        const { changed, result } = replaceInArray(d[parent]?.[child]);
        if (changed) {
          updates[field] = result;
          changes.push({ collection: 'posts', docId: p.id, field, action: 'substituir id na lista' });
        }
      }
      if (Array.isArray(d.comments) && d.comments.some((c: any) => c.userId === oldUserId)) {
        updates['comments'] = d.comments.map((c: any) => c.userId === oldUserId ? { ...c, userId: newUserId } : c);
        changes.push({ collection: 'posts', docId: p.id, field: 'comments[].userId', action: 'substituir id no(s) comentário(s)' });
      }
      if (!isDryRun && Object.keys(updates).length > 0) batch.update(p.ref, updates);
    }

    // --- 5. Reels: likes[] e comments[].userId ---
    const reelsSnap = await db.collection('reels').get();
    for (const r of reelsSnap.docs) {
      const d = r.data();
      const updates: Record<string, any> = {};
      const { changed, result } = replaceInArray(d.likes);
      if (changed) {
        updates.likes = result;
        changes.push({ collection: 'reels', docId: r.id, field: 'likes', action: 'substituir id na lista' });
      }
      if (Array.isArray(d.comments) && d.comments.some((c: any) => c.userId === oldUserId)) {
        updates.comments = d.comments.map((c: any) => c.userId === oldUserId ? { ...c, userId: newUserId } : c);
        changes.push({ collection: 'reels', docId: r.id, field: 'comments[].userId', action: 'substituir id no(s) coment.' });
      }
      if (!isDryRun && Object.keys(updates).length > 0) batch.update(r.ref, updates);
    }

    // --- 6. Ideas: likes[] ---
    const ideasSnap = await db.collection('ideas').get();
    for (const idea of ideasSnap.docs) {
      const { changed, result } = replaceInArray(idea.data().likes);
      if (changed) {
        changes.push({ collection: 'ideas', docId: idea.id, field: 'likes', action: 'substituir id na lista' });
        if (!isDryRun) batch.update(idea.ref, { likes: result });
      }
    }

    // --- 7. Jobs: applicants[] ---
    const jobsSnap = await db.collection('jobs').get();
    for (const job of jobsSnap.docs) {
      const { changed, result } = replaceInArray(job.data().applicants);
      if (changed) {
        changes.push({ collection: 'jobs', docId: job.id, field: 'applicants', action: 'substituir id na lista' });
        if (!isDryRun) batch.update(job.ref, { applicants: result });
      }
    }

    // --- 8. Business pages: likes[] ---
    const pagesSnap = await db.collection('business_pages').get();
    for (const p of pagesSnap.docs) {
      const { changed, result } = replaceInArray(p.data().likes);
      if (changed) {
        changes.push({ collection: 'business_pages', docId: p.id, field: 'likes', action: 'substituir id na lista' });
        if (!isDryRun) batch.update(p.ref, { likes: result });
      }
    }

    // --- 9. Communities: creatorId, members[], moderators[], pendingMembers[] ---
    const communitiesSnap = await db.collection('communities').get();
    for (const c of communitiesSnap.docs) {
      const d = c.data();
      const updates: Record<string, any> = {};
      if (d.creatorId === oldUserId) {
        updates.creatorId = newUserId;
        changes.push({ collection: 'communities', docId: c.id, field: 'creatorId', action: 'substituir id' });
      }
      for (const field of ['members', 'moderators', 'pendingMembers']) {
        const { changed, result } = replaceInArray(d[field]);
        if (changed) {
          updates[field] = result;
          changes.push({ collection: 'communities', docId: c.id, field, action: 'substituir id na lista' });
        }
      }
      if (!isDryRun && Object.keys(updates).length > 0) batch.update(c.ref, updates);
    }

    // --- 10. Events: creatorId, going[], maybe[] ---
    const eventsSnap = await db.collection('events').get();
    for (const e of eventsSnap.docs) {
      const d = e.data();
      const updates: Record<string, any> = {};
      if (d.creatorId === oldUserId) {
        updates.creatorId = newUserId;
        changes.push({ collection: 'events', docId: e.id, field: 'creatorId', action: 'substituir id' });
      }
      for (const field of ['going', 'maybe']) {
        const { changed, result } = replaceInArray(d[field]);
        if (changed) {
          updates[field] = result;
          changes.push({ collection: 'events', docId: e.id, field, action: 'substituir id na lista' });
        }
      }
      if (!isDryRun && Object.keys(updates).length > 0) batch.update(e.ref, updates);
    }

    // --- 11. Chats: members[] ---
    const chatsSnap = await db.collection('chats').get();
    for (const c of chatsSnap.docs) {
      const { changed, result } = replaceInArray(c.data().members);
      if (changed) {
        changes.push({ collection: 'chats', docId: c.id, field: 'members', action: 'substituir id na lista' });
        if (!isDryRun) batch.update(c.ref, { members: result });
      }
    }

    // --- 12. Messages: senderId ---
    const messagesSnap = await db.collection('messages').where('senderId', '==', oldUserId).get();
    for (const m of messagesSnap.docs) {
      changes.push({ collection: 'messages', docId: m.id, field: 'senderId', action: 'substituir id' });
      if (!isDryRun) batch.update(m.ref, { senderId: newUserId });
    }

    // --- 13. Friend requests: senderId / receiverId ---
    const frSenderSnap = await db.collection('friend_requests').where('senderId', '==', oldUserId).get();
    for (const f of frSenderSnap.docs) {
      changes.push({ collection: 'friend_requests', docId: f.id, field: 'senderId', action: 'substituir id' });
      if (!isDryRun) batch.update(f.ref, { senderId: newUserId });
    }
    const frReceiverSnap = await db.collection('friend_requests').where('receiverId', '==', oldUserId).get();
    for (const f of frReceiverSnap.docs) {
      changes.push({ collection: 'friend_requests', docId: f.id, field: 'receiverId', action: 'substituir id' });
      if (!isDryRun) batch.update(f.ref, { receiverId: newUserId });
    }

    if (!isDryRun) {
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      dryRun: isDryRun,
      oldUserId,
      newUserId,
      totalChanges: changes.length,
      changes,
      message: isDryRun
        ? 'Simulação: nada foi alterado. Confira "changes" e rode de novo com dryRun:false para aplicar de verdade.'
        : 'Aplicado com sucesso.',
    });
  } catch (error: any) {
    console.error('Erro em /api/admin-fix-account-id:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Erro interno.' });
  }
}
