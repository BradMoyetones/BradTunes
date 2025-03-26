import { StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval"; // Usamos idb-keyval para trabajar con IndexedDB

// Definir el almacenamiento en IndexedDB
export const indexDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log(name, "ha sido recuperado");
    return (await get(name)) || null; // Recupera el valor de IndexedDB
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // const parse = JSON.parse(value);
    // console.log(name, "con valor", parse, "ha sido guardado");
    await set(name, value); // Guarda el valor en IndexedDB
  },
  removeItem: async (name: string): Promise<void> => {
    // console.log(name, "ha sido eliminado");
    await del(name); // Elimina el valor de IndexedDB
  },
};

// Método para resetear el almacenamiento
export const resetIndexedDBStorage = async () => {
  try {
    const keys = await getAllKeys(); // Obtiene todas las claves almacenadas en IndexedDB
    await Promise.all(keys.map((key) => del(key))); // Elimina cada clave
    console.log("IndexedDB storage has been reset.");
  } catch (error) {
    console.error("Error resetting IndexedDB storage:", error);
  }
};

// Obtén todas las claves de IndexedDB (puedes agregar este helper)
const getAllKeys = async () => {
  return new Promise<string[]>((resolve, reject) => {
    const openRequest = indexedDB.open("keyval-store"); // Cambia por el nombre de tu almacenamiento
    openRequest.onerror = () => reject(openRequest.error);
    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("keyval", "readonly");
      const store = transaction.objectStore("keyval");
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    };
  });
};
