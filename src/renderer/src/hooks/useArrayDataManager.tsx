import { useCallback } from "react";

export function useArrayDataManager<T extends { id: number | string }>(
    setData: React.Dispatch<React.SetStateAction<T[]>>,
) {
    const onCreate = useCallback((value: T) => {
        setData(prev => [value, ...prev]);
    }, [setData]);

    const onUpdate = useCallback((value: T) => {
        setData(prev => prev.map(item => (item.id === value.id ? { ...item, ...value } : item)));
    }, [setData]);

    const onDelete = useCallback((value: T) => {
        setData(prev => prev.filter(item => item.id !== value.id));
    }, [setData]);

    return { onCreate, onUpdate, onDelete };
}