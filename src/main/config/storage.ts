import { is } from '@electron-toolkit/utils';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const basePath = is.dev
  ? path.join(__dirname, '../../src/renderer/public')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer');

let store: any;

// Archivos y carpetas que deben conservarse al cambiar de directorio
const conservationObjects = ['music', 'musicData.db'];

// Función para copiar archivos y carpetas de forma recursiva y forzada
const forceCopy = (source: string, destination: string) => {
  if (!fs.existsSync(source)) return;

  try {
    if (fs.lstatSync(source).isDirectory()) {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }

      const files = fs.readdirSync(source);
      files.forEach(file => {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);
        forceCopy(srcPath, destPath);
      });
    } else {
      fs.copyFileSync(source, destination);
    }
  } catch (error) {
    console.error(`Error copiando ${source}:`, error);
  }
};

// Función para eliminar archivos y carpetas de forma recursiva
const forceDelete = (target: string) => {
  if (!fs.existsSync(target)) return;

  try {
    if (fs.lstatSync(target).isDirectory()) {
      fs.readdirSync(target).forEach(file => {
        const filePath = path.join(target, file);
        forceDelete(filePath);
      });
      fs.rmdirSync(target);
    } else {
      fs.unlinkSync(target);
    }
  } catch (error) {
    console.error(`Error eliminando ${target}:`, error);
  }
};

// Importar electron-store de manera dinámica antes de usarlo
const initStore = async () => {
  if (!store) {
    const { default: Store } = await import('electron-store');
    store = new Store();
  }
};

// Obtener la ruta guardada o usar la predeterminada
const getMusicPath = async (): Promise<string> => {
  await initStore(); // Asegurar que store esté inicializado

  const savedPath = store?.get('musicPath') as string | undefined;
  return savedPath || path.join(basePath, 'music');
};

// Función para mover datos a un nuevo directorio
const moveDataToNewPath = async (newPath: string) => {
  const currentPath = path.dirname(await getMusicPath());

  conservationObjects.forEach((item) => {
    const oldItemPath = path.join(currentPath, item);
    const newItemPath = path.join(newPath, item);

    if (fs.existsSync(oldItemPath)) {
      forceCopy(oldItemPath, newItemPath);
      forceDelete(oldItemPath);
    }
  });
};

// Guardar una nueva ruta, copiar los datos y eliminar los anteriores
const setMusicPath = async (newPath: string): Promise<void> => {
  await initStore();
  await moveDataToNewPath(newPath);
  store?.set('musicPath', path.join(newPath, 'music'));
};

// Restablecer la ruta a la predeterminada, mover los datos y eliminar los anteriores
const resetMusicPath = async (): Promise<void> => {
  await initStore();
  await moveDataToNewPath(basePath);
  store?.delete('musicPath');
};

// Verificar si la ruta actual es la predeterminada
const isDefaultMusicPath = async (): Promise<boolean> => {
  return (await getMusicPath()) === path.join(basePath, 'music');
};

export { getMusicPath, setMusicPath, resetMusicPath, isDefaultMusicPath };
