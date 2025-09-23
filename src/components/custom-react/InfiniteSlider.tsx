import Slider from 'react-infinite-logo-slider';
import { useEffect, useState } from 'react';

type InfiniteSliderProps = {
  width?: string;
  duration?: number;
  pauseOnHover?: boolean;
  blurBorders?: boolean;
  blurBorderColor?: string;
  toRight?: boolean;
  imagePaths: string[];
};

const InfiniteSlider = ({
  width = '240px',
  duration = 30,
  pauseOnHover = true,
  blurBorders = true,
  blurBorderColor = '#fff',
  toRight = false,
  imagePaths = [],
}: InfiniteSliderProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-24 animate-pulse rounded bg-gray-100"></div>; // Loading placeholder
  }

  return (
    <Slider
      width={width}
      duration={duration}
      pauseOnHover={pauseOnHover}
      blurBorders={blurBorders}
      blurBorderColor={blurBorderColor}
      toRight={toRight}
    >
      {imagePaths.map((src: string, index: number) => (
        <Slider.Slide key={index}>
          <img src={src} alt={`Slide ${index + 1}`} className="w-36" loading="lazy" />
        </Slider.Slide>
      ))}
    </Slider>
  );
};

export default InfiniteSlider;
