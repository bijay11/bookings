// components/ReviewsModal.tsx
'use client';

import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import StarIcon from './StarIcon';

interface Review {
  reviewer: string;
  comment: string;
  rating: number;
  date: string;
}

interface ReviewsModalProps {
  listingId: string;
  averageRating: number;
  reviewCount: number;
  initialReviews: Review[];
  children: React.ReactNode;
}

export default function ReviewsModal({
  listingId,
  averageRating,
  reviewCount,
  initialReviews,
  children,
}: ReviewsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = async () => {
    setIsOpen(true);
    if (reviews.length === 0) {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8080/api/listings/${listingId}/reviews`
        );
        const data = await res.json();
        setReviews(data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div onClick={openModal}>{children}</div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-2xl font-bold">
                Reviews
              </Dialog.Title>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {review.reviewer}
                        </span>
                        <p className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="flex items-center px-2 py-1 bg-gray-100 rounded-full">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="ml-1 text-sm font-medium">
                          {review.rating}
                        </span>
                      </span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
