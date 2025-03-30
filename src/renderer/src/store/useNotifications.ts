import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: number;
    title: string;
    description: string;
    read: boolean;
    date: Date;
}

interface Store {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: number) => void;
    markAsRead: (id: number) => void;
}

export const useNotifications = create(
    persist<Store>(
        (set) => ({
            notifications: [],

            // Add a new notification
            addNotification: (notification) =>
                set((state) => ({
                    notifications: [...state.notifications, notification],
                })),

            // Remove a notification by ID
            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter((notif) => notif.id !== id),
                })),

            // Mark a notification as read
            markAsRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map((notif) =>
                        notif.id === id ? { ...notif, read: true } : notif
                    ),
                })),
        }),
        {
            name: 'notifications-storage', // Name of the key in local storage
        }
    )
);
