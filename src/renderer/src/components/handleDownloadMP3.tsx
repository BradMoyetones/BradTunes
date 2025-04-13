import { SongFull } from "@/types/data";

export async function handleDownloadMedia(song: SongFull, format: "mp3" | "mp4" = "mp3", musicPath: string) {
    try {
        const filePath = `${musicPath}/${format === "mp3" ? song.song : song.video}`;

        const result = await window.api.downloadMedia(filePath);
        if (!result.success) {
            throw new Error(result.error);
        }

        if (!result.buffer) {
            throw new Error("El buffer está vacío o no se recibió correctamente.");
        }

        const blob = new Blob([result.buffer]);
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${song.title}.${format}`;
        link.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Error al intentar descargar el archivo ${format.toUpperCase()}:`, error);
    }
}
