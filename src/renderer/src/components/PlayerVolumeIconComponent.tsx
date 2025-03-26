import {VolumeSilenced, VolumeLow, VolumeMedium, VolumeFull} from "@/icons/VolumeIcons";
import { usePlayerStore } from "@/store/usePlayerStore";


const isVolumeSilenced = (loud: number) => loud < 0.01
const isVolumeLow = (loud: number) => loud > 0 && loud < 0.5
const isVolumeMedium = (loud: number) => loud >= 0.5 && loud < 0.9
const isVolumeFull = (loud: number) => loud >= 0.9


const getVolumeIconByLouder = (loud: number) => {
  return (
    <>
      {isVolumeSilenced(loud) && <VolumeSilenced/>}
      {isVolumeLow(loud) && <VolumeLow/>}
      {isVolumeMedium(loud) && <VolumeMedium/>}
      {isVolumeFull(loud) && <VolumeFull/>}
    </>
  )
}


export const PlayerVolumeIconComponent = () => {
  const volume = usePlayerStore(state => state.volume)
  return getVolumeIconByLouder(volume)
}