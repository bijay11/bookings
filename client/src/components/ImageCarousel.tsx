'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';

type Props = {
  images: string[];
};

export default function ImageCarousel({ images }: Props) {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      className="rounded-lg"
      spaceBetween={10}
      slidesPerView={1}
    >
      {images.map((url, idx) => (
        <SwiperSlide key={idx}>
          <img
            src={url}
            alt={`Photo ${idx + 1}`}
            className="w-full h-80 object-cover rounded-lg"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
