import { HTMLAttributes } from "react";

export interface MusicVisualizerProps extends HTMLAttributes<HTMLDivElement> {
    numBars: number;
    width: number;
    height: number;
}