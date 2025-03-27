import React from 'react';

interface MusicVisualizer {
  numBars: number;
  width: number;
  height: number;
}

const MusicVisualizer: React.FC<MusicVisualizer> = ({ numBars, width, height }) => {
    // Crear un array de barras basado en el número de barras
    const bars = Array.from({ length: numBars }, (_, i) => i);

    return (
        <div className="flex gap-[1px] overflow-hidden justify-center items-end group-hover:hidden" style={{ width: width, height: height }}>
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

export default MusicVisualizer;
