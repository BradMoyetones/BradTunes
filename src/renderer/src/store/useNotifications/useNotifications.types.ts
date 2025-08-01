export interface Notification {
    id: number;
    title: string;
    description: string;
    read: boolean;
    date: Date;
}

export interface Store {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: number) => void;
    markAsRead: (id: number) => void;
}