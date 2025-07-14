import Slider from 'react-infinite-logo-slider';
import type { Image } from '~/types';

type InfiniteSliderProps = {
  width?: string;
  duration?: number;
  pauseOnHover?: boolean;
  blurBorders?: boolean;
  blurBorderColor?: string;
  images: Image[];
};

const InfiniteSlider = ({
  width = '240px',
  duration = 30,
  pauseOnHover = true,
  blurBorders = true,
  blurBorderColor = '#fff',
  images = [],
}: InfiniteSliderProps) => {
  return (
    <Slider
      width={width}
      duration={duration}
      pauseOnHover={pauseOnHover}
      blurBorders={blurBorders}
      blurBorderColor={blurBorderColor}
    >
      {images.map((image: { src: string }, index: number) => (
        <Slider.Slide key={index}>
          <img src={image.src} alt={`Slide ${index + 1}`} className="w-36" />
        </Slider.Slide>
      ))}
    </Slider>
  );
};

export default InfiniteSlider;
