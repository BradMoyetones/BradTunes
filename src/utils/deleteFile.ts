import fs from 'node:fs'

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const deleteFile = async (filePath: string, retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath, { force: true });
                console.log(`✅ Archivo eliminado: ${filePath}`);
            }
            return;
        } catch (error: any) {
            if (error.code === 'EBUSY' || error.code === 'EPERM') {
                console.warn(`⚠️ Archivo ocupado, reintentando... (${i + 1}/${retries})`);
                await wait(500); // Espera 500ms antes de reintentar
            } else {
                throw error;
            }
        }
    }
    throw new Error(`❌ No se pudo eliminar el archivo: ${filePath}`);
};