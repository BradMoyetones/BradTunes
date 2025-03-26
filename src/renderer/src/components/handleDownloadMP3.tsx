import { SongFull } from "@/types/data";

export async function handleDownloadMedia(song: SongFull, format: "mp3" | "mp4" = "mp3") {
    try {
        const fileUrl = format === "mp3" ? song.song : song.video; // Selecciona MP3 o MP4

        if (!fileUrl) {
            console.error(`No se encontró el archivo de la canción en formato ${format.toUpperCase()}.`);
            return;
        }

        // Hacer una solicitud para obtener el archivo
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Error al descargar el archivo ${format.toUpperCase()}`);
        }

        // Crear un Blob a partir de la respuesta
        const blob = await response.blob();

        // Crear una URL de objeto para el Blob
        const url = URL.createObjectURL(blob);

        // Crear un enlace invisible para iniciar la descarga
        const link = document.createElement("a");
        link.href = url;
        link.download = `${song.title}.${format}`; // Nombre del archivo con extensión

        // Simular un clic en el enlace para iniciar la descarga
        link.click();

        // Liberar la URL creada
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Error al intentar descargar el archivo ${format.toUpperCase()}:`, error);
    }
}
