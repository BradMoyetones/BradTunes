import React from 'react';
import { MusicVisualizerProps } from './MusicVisualizer.types';
import { cn } from '@/lib/utils';

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ numBars, width, height, className, ...rest }) => {
    // Crear un array de barras basado en el número de barras
    const bars = Array.from({ length: numBars }, (_, i) => i);

    return (
        <div className={cn("flex gap-[1px] overflow-hidden justify-center items-end", className)} style={{ width: width, height: height }} {...rest}>
            {bars.map((_, index) => (
                <div 
                    key={index+_} 
                    className={`bg-primary rounded-t-sm animate-bar w-[10%] h-[110%]`}
                    style={{
                        animationDelay: `${index * 0.3}s`, // Aplica el retraso de la animación
                    }}
                />
            ))}
        </div>
    );
};
