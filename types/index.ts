// ─── PRODUCT ──────────────────────────────────────────────────────────────────
export interface Product {
    id: string;
    name: string;
    brand: string;
    category: string; // 'Tablet' | 'Syrup' | 'Capsule' | 'Injection' | 'Chewable' | 'Gel' | 'Device' | 'Ayurvedic'
    salt?: string;
    price: number;
    mrp: number;
    discount?: number;
    packSize?: string;
    requiresPrescription?: boolean;
    imageUrl?: string;
    stock: number;
    sku?: string;
    description?: string;
    uses?: string;
    sideEffects?: string;
    storage?: string;
    safetyAdvice?: string;
}

// ─── ORDER ────────────────────────────────────────────────────────────────────
export interface CartItem {
    productId: string;
    productName: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    packSize?: string;
    requiresPrescription?: boolean;
}

export interface Order {
    id: string;
    userId: string;
    userName?: string;
    items: CartItem[];
    totalAmount: number;
    gst: number;
    deliveryFee: number;
    status: 'pending' | 'confirmed' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
    paymentMethod: 'cod';
    deliveryAddress: Address;
    serviceType: 'home_delivery' | 'store_takeaway';
    prescriptionId?: string;
    needsConsultation?: boolean;
    createdAt: any;
}

// ─── ADDRESS ──────────────────────────────────────────────────────────────────
export interface Address {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    pincode: string;
}

// ─── USER ─────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: 'customer' | 'admin';
    address?: Address; // Default address
    savedAddresses?: Address[]; // List of all addresses
    favoriteIds?: string[]; // IDs of favorited products
    healthPoints?: number;
}

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────────
export interface Subscription {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    price: number;
    packSize?: string;
    frequency: 'monthly' | 'bi-monthly';
    status: 'active' | 'paused' | 'cancelled';
    nextRefillDate: any;
    createdAt: any;
}

// ─── PRESCRIPTION ─────────────────────────────────────────────────────────────
export interface Prescription {
    id: string;
    userId: string;
    imageUrl: string;
    doctorName?: string;
    status: 'pending' | 'verified' | 'rejected' | 'expired';
    itemsCount?: number;
    createdAt: any;
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────
export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'order_update' | 'prescription_update' | 'general';
    read: boolean;
    createdAt: any;
}
