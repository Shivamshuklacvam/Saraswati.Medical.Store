import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '../types';

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, qty: number) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === item.productId);
            if (existing) {
                return prev.map(i =>
                    i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    };

    const updateQuantity = (productId: string, qty: number) => {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev =>
            prev.map(i => (i.productId === productId ? { ...i, quantity: qty } : i))
        );
    };

    const clearCart = () => setItems([]);

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
