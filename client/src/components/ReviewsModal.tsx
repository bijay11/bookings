'use client';

import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import StarIcon from './StarIcon';

interface Review {
  reviewer: string;
  avatar_url: string;
  location: string; // Combined location
  trip_type: string;
  rating: number;
  date: string;
  comment: string;
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
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Modal panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl p-6 relative">
            {/* Header */}
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

            {/* Loading */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar_url || '/default-avatar.jpg'}
                        alt={review.reviewer}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {review.reviewer}
                            </p>
                            <p className="text-sm text-gray-500">
                              {review.location}
                            </p>
                          </div>
                          <span className="flex items-center px-2 py-1 bg-gray-100 rounded-full">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="ml-1 text-sm font-medium">
                              {review.rating.toFixed(1)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <span>{review.trip_type}</span>
                          <span>·</span>
                          <span>
                            {new Date(review.date).toLocaleDateString(
                              undefined,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                        <p className="mt-3 text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
