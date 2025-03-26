import { SongFull } from "@/types/data";
import { CurrentMusic } from "@/utils/PlayerManager";


export function useCurrentMusic(currentMusic: CurrentMusic) {

  const getCurrentSongIndex = () => {
    if (currentMusic.songs.length === 0 || currentMusic.song === null) return -1;
    return currentMusic.songs.findIndex(e => e.id === currentMusic.song!.id) ?? -1
  }

  const getNextSong = (): null | SongFull => {
    const {songs} = currentMusic;
    const totalOfSongsInPlaylist = songs.length;
    if (totalOfSongsInPlaylist === 0) return null;

    const index = getCurrentSongIndex();
    if (index + 1 >= totalOfSongsInPlaylist) {
      return null;
    }
    return songs[index + 1];
  }

  const getPreviousSong = (): null | SongFull => {
    const index = getCurrentSongIndex();
    if (index <= 0) {
      return null;
    }
    return currentMusic.songs[index - 1];
  }


  return {getPreviousSong, getNextSong}

}