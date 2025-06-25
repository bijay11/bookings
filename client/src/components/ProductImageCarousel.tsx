'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import Image from 'next/image';
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProductImageCarouselProps {
  images: string[];
  title: string;
}

export default function ProductImageCarousel({
  images,
  title,
}: ProductImageCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const prevRef = React.useRef<HTMLDivElement>(null);
  const nextRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

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
        spaceBetween={0}
        className="rounded-2xl overflow-hidden shadow-lg relative"
        style={{ width: '100%', aspectRatio: '16/9' }}
        onInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
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
        {/* Custom navigation buttons */}
        <div
          ref={prevRef}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-white transition cursor-pointer"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div
          ref={nextRef}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-white transition cursor-pointer"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
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

      {/* Zoom Modal */}
      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        {/* Backdrop - click to close */}
        <div
          className="fixed inset-0 bg-black/75 cursor-pointer"
          aria-hidden="true"
          onClick={closeModal}
        />

        {/* Modal container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            className="w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition cursor-pointer"
                aria-label="Close zoom view"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
            </div>

            {/* Image container */}
            <div className="flex-1 relative overflow-hidden">
              <Image
                src={images[selectedImageIndex]}
                alt={`Zoomed view of ${title}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="p-4 bg-black/50">
                <Swiper
                  spaceBetween={8}
                  slidesPerView={Math.min(5, images.length)}
                  className="max-w-2xl mx-auto"
                >
                  {images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div
                        className={`relative aspect-video rounded overflow-hidden border-2 ${
                          selectedImageIndex === idx
                            ? 'border-white'
                            : 'border-transparent'
                        }`}
                      >
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
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
