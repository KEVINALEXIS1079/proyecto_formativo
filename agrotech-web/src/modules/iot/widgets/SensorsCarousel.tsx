import React, { useRef } from 'react';
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Sensor } from "../model/iot.types";
import { SensorCard } from "./SensorCard";

interface SensorsCarouselProps {
  sensors: Sensor[];
  onToggleSensor: (id: number) => void;
  onEditSensor: (sensor: Sensor) => void;
}

export const SensorsCarousel: React.FC<SensorsCarouselProps> = ({ sensors, onToggleSensor, onEditSensor }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (sensors.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500">No hay sensores configurados aún.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      <Button
        isIconOnly
        variant="flat"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex bg-white/80 backdrop-blur-sm shadow-md"
        onPress={() => scroll('left')}
      >
        <ChevronLeft />
      </Button>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-2 pb-4 px-2 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sensors.map(sensor => (
          <div key={sensor.id} className="snap-start">
            <SensorCard sensor={sensor} onToggle={onToggleSensor} onEdit={onEditSensor} sensors={sensors} />
          </div>
        ))}
      </div>

      <Button
        isIconOnly
        variant="flat"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex bg-white/80 backdrop-blur-sm shadow-md"
        onPress={() => scroll('right')}
      >
        <ChevronRight />
      </Button>
    </div>
  );
};
