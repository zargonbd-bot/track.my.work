// src/lib/firebase.js
// Zargon Production Tracker — Firebase + Demo Mode Service

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_FIREBASE_API_KEY === 'demo';

// ─── Demo Data Store (localStorage) ─────────────────────────────────────────
const STORAGE_KEY = 'zargon_records';
const DEMO_RECORDS = [
  {
    id: 'demo1',
    date: '2024-12-01',
    productId: 'PRD-001',
    photoshootCompleted: true,
    rawCreativeCount: 12,
    editCreativeCount: 8,
    hookEditCount: 5,
    editorName: 'Hamim Hossain',
    createdAt: new Date('2024-12-01').toISOString(),
  },
  {
    id: 'demo2',
    date: '2024-12-02',
    productId: 'PRD-002',
    photoshootCompleted: true,
    rawCreativeCount: 20,
    editCreativeCount: 15,
    hookEditCount: 8,
    editorName: 'Abdullahil Kafi',
    createdAt: new Date('2024-12-02').toISOString(),
  },
  {
    id: 'demo3',
    date: '2024-12-03',
    productId: 'PRD-003',
    photoshootCompleted: false,
    rawCreativeCount: 10,
    editCreativeCount: 6,
    hookEditCount: 3,
    editorName: 'Hamim Hossain',
    createdAt: new Date('2024-12-03').toISOString(),
  },
  {
    id: 'demo4',
    date: '2024-12-05',
    productId: 'PRD-004',
    photoshootCompleted: true,
    rawCreativeCount: 18,
    editCreativeCount: 12,
    hookEditCount: 6,
    editorName: 'Abdullahil Kafi',
    createdAt: new Date('2024-12-05').toISOString(),
  },
  {
    id: 'demo5',
    date: '2024-12-07',
    productId: 'PRD-005',
    photoshootCompleted: true,
    rawCreativeCount: 25,
    editCreativeCount: 20,
    hookEditCount: 10,
    editorName: 'Hamim Hossain',
    createdAt: new Date('2024-12-07').toISOString(),
  },
  {
    id: 'demo6',
    date: '2024-12-10',
    productId: 'PRD-006',
    photoshootCompleted: false,
    rawCreativeCount: 8,
    editCreativeCount: 4,
    hookEditCount: 2,
    editorName: 'Abdullahil Kafi',
    createdAt: new Date('2024-12-10').toISOString(),
  },
  {
    id: 'demo7',
    date: '2024-12-12',
    productId: 'PRD-007',
    photoshootCompleted: true,
    rawCreativeCount: 30,
    editCreativeCount: 22,
    hookEditCount: 12,
    editorName: 'Hamim Hossain',
    createdAt: new Date('2024-12-12').toISOString(),
  },
  {
    id: 'demo8',
    date: '2024-12-15',
    productId: 'PRD-008',
    photoshootCompleted: true,
    rawCreativeCount: 14,
    editCreativeCount: 10,
    hookEditCount: 5,
    editorName: 'Abdullahil Kafi',
    createdAt: new Date('2024-12-15').toISOString(),
  },
];

function getDemoRecords() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_RECORDS));
  return DEMO_RECORDS;
}

function saveDemoRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ─── Auth Service ─────────────────────────────────────────────────────────────
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@zargon.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zargon2024';
const AUTH_KEY = 'zargon_auth';

export const authService = {
  async login(email, password) {
    if (DEMO_MODE) {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const user = { uid: 'admin', email, displayName: 'Admin' };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid credentials. Use: ' + ADMIN_EMAIL + ' / ' + ADMIN_PASSWORD);
    }
    // Real Firebase Auth
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    const auth = getAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  async logout() {
    if (DEMO_MODE) {
      localStorage.removeItem(AUTH_KEY);
      return;
    }
    const { getAuth, signOut } = await import('firebase/auth');
    await signOut(getAuth());
  },

  getCurrentUser() {
    if (DEMO_MODE) {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  },

  onAuthStateChanged(callback) {
    if (DEMO_MODE) {
      const user = this.getCurrentUser();
      callback(user);
      return () => {};
    }
    return () => {};
  },
};

// ─── Database Service ─────────────────────────────────────────────────────────
export const db = {
  async getAll() {
    if (DEMO_MODE) {
      return getDemoRecords();
    }
    const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const firestore = getFirestore();
    const q = query(collection(firestore, 'records'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async add(record) {
    if (DEMO_MODE) {
      const records = getDemoRecords();
      const newRec = {
        ...record,
        id: 'rec_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      records.unshift(newRec);
      saveDemoRecords(records);
      return newRec;
    }
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const firestore = getFirestore();
    const docRef = await addDoc(collection(firestore, 'records'), {
      ...record,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...record };
  },

  async update(id, record) {
    if (DEMO_MODE) {
      const records = getDemoRecords();
      const idx = records.findIndex(r => r.id === id);
      if (idx !== -1) records[idx] = { ...records[idx], ...record };
      saveDemoRecords(records);
      return { id, ...record };
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const firestore = getFirestore();
    await updateDoc(doc(firestore, 'records', id), record);
    return { id, ...record };
  },

  async delete(id) {
    if (DEMO_MODE) {
      const records = getDemoRecords().filter(r => r.id !== id);
      saveDemoRecords(records);
      return;
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const firestore = getFirestore();
    await deleteDoc(doc(firestore, 'records', id));
  },

  subscribe(callback) {
    if (DEMO_MODE) {
      callback(getDemoRecords());
      return () => {};
    }
    return () => {};
  },
};

export const isDemoMode = DEMO_MODE;
