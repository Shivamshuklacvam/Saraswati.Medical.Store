import { db } from './config';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';
import { Product, Order, CartItem, User, Subscription, Prescription, AppNotification, Medication, MedicationLog } from '../types';

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const getProducts = async (): Promise<Product[]> => {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
    const ref = doc(db, 'products', id);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
};

export const searchProducts = async (term: string): Promise<Product[]> => {
    const all = await getProducts();
    const lower = term.toLowerCase();
    return all.filter(
        p =>
            p.name.toLowerCase().includes(lower) ||
            p.brand.toLowerCase().includes(lower) ||
            (p.salt ?? '').toLowerCase().includes(lower)
    );
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const q = query(collection(db, 'products'), where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    return addDoc(collection(db, 'products'), product);
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
    return updateDoc(doc(db, 'products', id), data);
};

export const deleteProduct = async (id: string) => {
    return deleteDoc(doc(db, 'products', id));
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const placeOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    return addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: Timestamp.now(),
        status: 'pending',
    });
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const getAllOrders = async (): Promise<Order[]> => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const updateOrderStatus = async (id: string, status: string) => {
    return updateDoc(doc(db, 'orders', id), { status });
};

export const updateOrder = async (id: string, data: Partial<Order>) => {
    return updateDoc(doc(db, 'orders', id), data);
};

export const deleteOrder = async (id: string) => {
    return deleteDoc(doc(db, 'orders', id));
};

// ─── USER PROFILE ────────────────────────────────────────────────────────────

export const getUserProfile = async (uid: string): Promise<User | null> => {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<User>) => {
    return updateDoc(doc(db, 'users', uid), data);
};

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

export const createSubscription = async (sub: Omit<Subscription, 'id' | 'createdAt'>) => {
    return addDoc(collection(db, 'subscriptions'), {
        ...sub,
        createdAt: Timestamp.now(),
        status: 'active',
    });
};

export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
    const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subscription));
};

export const updateSubscriptionStatus = async (id: string, status: 'active' | 'paused' | 'cancelled') => {
    return updateDoc(doc(db, 'subscriptions', id), { status });
};

// ─── PRESCRIPTIONS ───────────────────────────────────────────────────────────

export const uploadPrescription = async (presc: Omit<Prescription, 'id' | 'createdAt'>) => {
    return addDoc(collection(db, 'prescriptions'), {
        ...presc,
        createdAt: Timestamp.now(),
        status: 'pending',
    });
};

export const getUserPrescriptions = async (userId: string): Promise<Prescription[]> => {
    const q = query(
        collection(db, 'prescriptions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Prescription));
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
};

export const markNotificationRead = async (id: string) => {
    return updateDoc(doc(db, 'notifications', id), { read: true });
};

// ─── MEDICATION TRACKER ───────────────────────────────────────────────────────

export const getMedications = async (userId: string): Promise<Medication[]> => {
    const q = query(
        collection(db, 'medications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Medication));
};

export const addMedication = async (med: Omit<Medication, 'id' | 'createdAt'>) => {
    return addDoc(collection(db, 'medications'), {
        ...med,
        createdAt: Timestamp.now(),
    });
};

export const deleteMedication = async (id: string) => {
    return deleteDoc(doc(db, 'medications', id));
};

export const updateMedicationInventory = async (id: string, newTotal: number) => {
    return updateDoc(doc(db, 'medications', id), { totalPills: newTotal });
};

export const getMedicationLogs = async (userId: string, date: string): Promise<MedicationLog[]> => {
    const q = query(
        collection(db, 'intake_logs'),
        where('userId', '==', userId),
        where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MedicationLog));
};

export const logMedicationIntake = async (log: Omit<MedicationLog, 'id' | 'timestamp'>) => {
    return addDoc(collection(db, 'intake_logs'), {
        ...log,
        timestamp: Timestamp.now(),
    });
};

export const updateMedicationLogStatus = async (id: string, status: 'taken' | 'skipped' | 'missed') => {
    return updateDoc(doc(db, 'intake_logs', id), { status });
};
