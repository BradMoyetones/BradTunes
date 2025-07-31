import { useEffect, useState } from "react"

export function useImageExists(src?: string | null) {
  const [validSrc, setValidSrc] = useState("/img/placeholder.svg")

    useEffect(() => {
        if (!src) {
            setValidSrc("/img/placeholder.svg")
            return
        }

        const img = new Image()
        img.onload = () => setValidSrc(src)
        img.onerror = () => setValidSrc("/img/placeholder.svg")
        img.src = src
    }, [src])

    return validSrc
}
