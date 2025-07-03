'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import Image from 'next/image';
import { NavButton } from './NavButton';
import { Modal } from '../modal';

interface ProductImageCarouselProps {
  images: string[];
  title: string;
}

export function ProductImageCarousel({
  images,
  title,
}: ProductImageCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <div className="relative">
      {/* Main carousel */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        thumbs={{ swiper: thumbsSwiper }}
        onInit={(swiper) => {
          // @ts-expect-error Preventing temp ts error
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error Preventing temp ts error
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        onSlideChange={({ isBeginning, isEnd }) => {
          setIsBeginning(isBeginning);
          setIsEnd(isEnd);
        }}
        spaceBetween={0}
        className="rounded-2xl overflow-hidden shadow-lg relative"
        style={{ width: '100%', aspectRatio: '16/9' }}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="relative w-full h-full cursor-zoom-in"
              onClick={() => openModal(idx)}
            >
              <Image
                src={img}
                alt={`${title} image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={idx === 0}
              />
            </div>
          </SwiperSlide>
        ))}

        <NavButton
          direction="prev"
          disabled={isBeginning}
          onRef={(el) => (prevRef.current = el)}
        />
        <NavButton
          direction="next"
          disabled={isEnd}
          onRef={(el) => (nextRef.current = el)}
        />
      </Swiper>

      {/* Thumbnails */}
      {images.length > 1 && (
        <Swiper
          modules={[Thumbs, FreeMode]}
          onSwiper={setThumbsSwiper}
          spaceBetween={12}
          slidesPerView={Math.min(5, images.length)}
          freeMode={true}
          watchSlidesProgress
          className="mt-4"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx} className="cursor-pointer">
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent transition-all hover:border-gray-300">
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} images={images} selectedImageIndex={selectedImageIndex} setSelectedImageIndex={setSelectedImageIndex} title={title} />
    </div>
  );
}
