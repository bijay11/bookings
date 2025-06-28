'use client';

import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  title: string;
}

export function Modal({
  isOpen,
  onClose,
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  title,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/75 cursor-pointer"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="w-full h-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition cursor-pointer"
              aria-label="Close zoom view"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <Image
              src={images[selectedImageIndex]}
              alt={`Zoomed view of ${title}`}
              fill
              className="object-contain"
              priority
            />
          </div>

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
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-video rounded overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedImageIndex === idx
                          ? 'border-white'
                          : 'border-transparent hover:border-gray-400'
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
  );
}
