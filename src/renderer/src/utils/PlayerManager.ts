import { usePlayerStore } from "@/store/usePlayerStore";
import { Playlist, SongFull } from "@/types/data";

export interface CurrentMusic {
    playlist: Playlist | null; // Playlist actual (si existe)
    song: SongFull | null; // Canción en reproducción
    songs: SongFull[]; // Canciones de la playlist
}

// Definimos la estructura del estado del reproductor
export interface PlayerState {
    currentMusic: CurrentMusic;
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    duration: string;
    loopMode: "none" | "song" | "playlist";
    isShuffling: boolean;
    selectedDeviceId: string;
    changeSong: (song: SongFull) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    seek: (time: number) => void;
    nextSong: () => void;
    prevSong: () => void;

    setCurrentMusic: (newMusic: CurrentMusic) => void;

    toggleShuffle: () => void;
    toggleLoopMode: () => void;
}

// Clase que maneja la lógica de reproducción
export class PlayerManager {
    public audioRef: HTMLAudioElement;
    public videoRef: HTMLVideoElement | null = null;
    public updateState: React.Dispatch<React.SetStateAction<PlayerState>>;
    public isSeeking: boolean = false; // Nuevo estado para saber si el usuario está moviendo el slider

    constructor(updateState: React.Dispatch<React.SetStateAction<PlayerState>>) {
        this.audioRef = new Audio();
        this.videoRef = document.createElement("video");
        this.updateState = updateState;

        this.audioRef.ontimeupdate = () => {
            if (!this.isSeeking) { // Solo actualiza si el usuario no está moviendo el slider
                this.updateState((prevState) => ({
                    ...prevState,
                    currentTime: this.audioRef.currentTime,
                }));
            }
        };

        this.audioRef.onended = () => {
            this.nextSong();
        };
    }

    setAudioElement(audio: HTMLAudioElement) {
        this.audioRef = audio;
    }

    setVideoElement(video: HTMLVideoElement) {
        this.videoRef = video;
    }

    toggleShuffle() {
        this.updateState((prevState) => {
            usePlayerStore.setState({
                isShuffling: !prevState.isShuffling,
            });
            return {
                ...prevState,
                isShuffling: !prevState.isShuffling,
            }
        });
    }

    toggleLoopMode() {
        this.updateState((prevState) => {
            let newLoopMode: "none" | "song" | "playlist";

            switch (prevState.loopMode) {
                case "none":
                    newLoopMode = "playlist";
                    break;
                case "playlist":
                    newLoopMode = "song";
                    break;
                case "song":
                default:
                    newLoopMode = "none";
                    break;
            }
            usePlayerStore.setState({
                loopMode: newLoopMode,
            });
            return { ...prevState, loopMode: newLoopMode };
        });
    }

    async changePlaylistAndSong(playlist: Playlist | null, song: SongFull | null) {
        try {
            // 🔍 Si la canción y la playlist son las mismas, solo alternar play/pause
            if (usePlayerStore.getState().currentSong?.id === song?.id && usePlayerStore.getState().currentPlaylist?.id === playlist?.id) {
                this.togglePlay();
                return this.updateState((prevState) => ({
                    ...prevState,
                    isPlaying: !prevState.isPlaying,
                }));
            }

            const result: CurrentMusic = await window.api.songs(playlist, song);

            if (usePlayerStore.getState().isShuffling) {
                // 🔀 Mezclar canciones
                const filteredSongs = result.songs.filter(s => s.id !== song?.id);
                const shuffledSongs = filteredSongs.sort(() => Math.random() - 0.5);
                result.songs = result.song ? [result.song, ...shuffledSongs] : shuffledSongs;    
            }

            usePlayerStore.setState({
                currentPlaylist: result.playlist,
                currentSong: song,
                currentTime: 0
            });

            this.updateState((prevState) => ({
                ...prevState,
                currentMusic: result,
                currentTime: 0,
                isPlaying: true,
                duration: song?.duration || "0:00",
            }));

            this.audioRef.src = song?.song || "";
            this.audioRef.currentTime = 0;

            if (this.videoRef) {
                if (song && song.video) {
                    this.videoRef.src = song.video;
                    this.videoRef.volume = 0;
                } else {
                    this.videoRef.src = "";
                }
                this.videoRef.currentTime = 0;
            }
    
            this.audioRef.play();
            if (this.videoRef && song?.video) this.videoRef.play();
        } catch(e){
            console.log(e);
            
        }
        
    }
    

    changeSong(song: SongFull) {
        this.updateState((prevState) => {
            const { song: currentSong } = prevState.currentMusic;
    
            // Si la canción es la misma, solo alternar entre play y pausa
            if (currentSong?.id === song.id) {
                this.togglePlay();
                return prevState; // No cambia el estado, solo maneja play/pause
            }
    
            // Si es una nueva canción, cargarla correctamente
            if (this.audioRef.src !== song.song) {
                this.audioRef.src = song.song;
                this.audioRef.currentTime = 0;
            }
    
            if (this.videoRef) {
                if (song.video && this.videoRef.src !== song.video) {
                    this.videoRef.src = song.video;
                    this.videoRef.volume = 0;
                } else if (!song.video) {
                    this.videoRef.src = "";
                }
                this.videoRef.currentTime = 0;
            }
    
            // Reproducir la nueva canción
            this.audioRef.play();
            if (this.videoRef && song.video) {
                this.videoRef.play();
                this.videoRef.volume = 0;
            }
            
    
            // Actualizar el estado global
            usePlayerStore.setState({
                currentSong: song,
                currentTime: 0, // Reseteamos el tiempo en el store
            });
    
            return {
                ...prevState,
                currentMusic: { ...prevState.currentMusic, song },
                currentTime: 0,
                isPlaying: true,
                duration: song.duration,
            };
        });
    }    

    async togglePlay() {
        const { currentSong } = usePlayerStore.getState(); // Obtiene la canción actual
    
        if (!this.audioRef.src) {
            if (currentSong?.song) {
                console.warn("El audio no tiene src, cargando desde la canción actual...");
                this.audioRef.src = currentSong.song;
                this.audioRef.currentTime = usePlayerStore.getState().currentTime || 0; // Restaurar tiempo si existe
            } else {
                console.error("No hay una canción disponible para reproducir.");
                return;
            }
        }
    
        if (this.audioRef.paused) {
            try {
                await this.audioRef.play();
                if (this.videoRef && currentSong?.video) {
                    this.videoRef.src = currentSong.video; 
                    await this.videoRef.play();
                    this.videoRef.volume = 0;
                }
                this.updateState((prevState) => ({ ...prevState, isPlaying: true }));
            } catch (error) {
                console.error("Error al reproducir el audio:", error);
            }
        } else {
            this.audioRef.pause();
            if (this.videoRef) this.videoRef.pause();
            this.updateState((prevState) => ({ ...prevState, isPlaying: false }));
        }
    }
    

    setVolume(volume: number) {
        this.audioRef.volume = volume;
        this.updateState((prevState) => ({ ...prevState, volume }));
    }

    seek(time: number) {
        this.audioRef.currentTime = time;
        if (this.videoRef) {
            this.videoRef.currentTime = time;
        }
        this.updateState((prevState) => ({ ...prevState, currentTime: time }));
    }

    startSeeking() {
        this.isSeeking = true;
    }

    stopSeeking(time: number) {
        this.isSeeking = false;
        this.seek(time);
    }

    nextSong() {
        this.updateState((prevState) => {
            const { songs, song, playlist } = prevState.currentMusic;
            if (!song || songs.length === 0) return prevState; // No hay canciones disponibles
            
            const currentIndex = songs.findIndex((s) => s.id === song.id);
            let nextIndex = currentIndex + 1;
    
            if (nextIndex >= songs.length) {
                if (prevState.loopMode === "playlist") {
                    nextIndex = 0; // Volver al inicio si el loop está activado
                } else {
                    return { ...prevState, isPlaying: false }; // Detener reproducción si no hay más canciones
                }
            }
    
            const nextSong = songs[nextIndex];
            this.changeSong(nextSong);
    
            // Actualizar el store con la nueva canción y la playlist
            usePlayerStore.setState({
                currentSong: nextSong,
                currentPlaylist: playlist,
            });
    
            return {
                ...prevState,
                currentMusic: { ...prevState.currentMusic, song: nextSong },
            };
        });
    }
    
    
    prevSong() {
        this.updateState((prevState) => {
            const { songs, song, playlist } = prevState.currentMusic;
            if (!song || songs.length === 0) return prevState;
    
            const currentIndex = songs.findIndex((s) => s.id === song.id);
    
            // Si el usuario retrocede dentro de los primeros 3 segundos o es la primera canción, solo reiniciar la actual
            if (this.audioRef.currentTime > 3 || currentIndex === 0) {
                this.audioRef.currentTime = 0;
                if (this.videoRef) this.videoRef.currentTime = 0; // Reiniciar video si existe
                return prevState;
            }
    
            const prevSong = songs[currentIndex - 1];
            this.changeSong(prevSong);
    
            // Actualizar el store con la nueva canción y la playlist
            usePlayerStore.setState({
                currentSong: prevSong,
                currentPlaylist: playlist,
            });
    
            return {
                ...prevState,
                currentMusic: { ...prevState.currentMusic, song: prevSong },
            };
        });
    }    
}