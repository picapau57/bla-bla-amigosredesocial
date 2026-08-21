import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Mesmo ID de banco usado pelo app cliente (src/lib/firebase.ts)
const FIRESTORE_DB_ID = 'ai-studio-84899bc3-e76b-467e-8f0d-8498c43bf9e0';

let firebaseAdminApp: App | null = null;

export function getFirebaseAdminFirestore() {
  if (!firebaseAdminApp) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined in environment variables.');
    }
    const serviceAccount = JSON.parse(raw);
    // Evita reinicializar o app em execuções "quentes" da função serverless
    firebaseAdminApp = getApps().length ? (getApps()[0] as App) : initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore(firebaseAdminApp, FIRESTORE_DB_ID);
}
