import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_COMMUNITIES,
  INITIAL_EVENTS,
  INITIAL_STORIES,
  INITIAL_ADS,
  INITIAL_BUSINESS_PAGES,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_LOGS,
  INITIAL_JOBS
} from '../data/mockData';

export async function seedDatabaseIfEmpty() {
  try {
    // Force set the correct admin user to avoid "Usuário não encontrado"
    const adminUser = INITIAL_USERS.find(u => u.id === 'admin');
    if (adminUser) {
      await setDoc(doc(db, 'users', 'admin'), adminUser);
    }

    // Clean up old user-admin doc
    try {
      await deleteDoc(doc(db, 'users', 'user-admin'));
    } catch (e) {
      // ignore
    }

    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (usersSnapshot.empty) {
      console.log('Seeding initial users to Firestore...');
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    }

    const postsSnapshot = await getDocs(collection(db, 'posts'));
    if (postsSnapshot.empty) {
      console.log('Seeding initial posts to Firestore...');
      for (const p of INITIAL_POSTS) {
        await setDoc(doc(db, 'posts', p.id), p);
      }
    }

    const communitiesSnapshot = await getDocs(collection(db, 'communities'));
    if (communitiesSnapshot.empty) {
      console.log('Seeding initial communities to Firestore...');
      for (const c of INITIAL_COMMUNITIES) {
        await setDoc(doc(db, 'communities', c.id), c);
      }
    }

    const eventsSnapshot = await getDocs(collection(db, 'events'));
    if (eventsSnapshot.empty) {
      console.log('Seeding initial events to Firestore...');
      for (const e of INITIAL_EVENTS) {
        await setDoc(doc(db, 'events', e.id), e);
      }
    }

    const storiesSnapshot = await getDocs(collection(db, 'stories'));
    if (storiesSnapshot.empty) {
      console.log('Seeding initial stories... to Firestore');
      for (const s of INITIAL_STORIES) {
        await setDoc(doc(db, 'stories', s.id), s);
      }
    }

    const adsSnapshot = await getDocs(collection(db, 'ads'));
    if (adsSnapshot.empty) {
      console.log('Seeding initial ads to Firestore...');
      for (const a of INITIAL_ADS) {
        await setDoc(doc(db, 'ads', a.id), a);
      }
    }

    const pagesSnapshot = await getDocs(collection(db, 'pages'));
    if (pagesSnapshot.empty) {
      console.log('Seeding initial pages to Firestore...');
      for (const p of INITIAL_BUSINESS_PAGES) {
        await setDoc(doc(db, 'pages', p.id), p);
      }
    }

    const chatsSnapshot = await getDocs(collection(db, 'chats'));
    if (chatsSnapshot.empty) {
      console.log('Seeding initial chats to Firestore...');
      for (const c of INITIAL_CHATS) {
        await setDoc(doc(db, 'chats', c.id), c);
      }
    }

    const messagesSnapshot = await getDocs(collection(db, 'messages'));
    if (messagesSnapshot.empty) {
      console.log('Seeding initial messages to Firestore...');
      for (const m of INITIAL_MESSAGES) {
        await setDoc(doc(db, 'messages', m.id), m);
      }
    }

    const logsSnapshot = await getDocs(collection(db, 'logs'));
    if (logsSnapshot.empty) {
      console.log('Seeding initial logs to Firestore...');
      for (const l of INITIAL_LOGS) {
        await setDoc(doc(db, 'logs', l.id), l);
      }
    }

    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    if (jobsSnapshot.empty) {
      console.log('Seeding initial jobs to Firestore...');
      for (const j of INITIAL_JOBS) {
        await setDoc(doc(db, 'jobs', j.id), j);
      }
    }
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
  }
}
