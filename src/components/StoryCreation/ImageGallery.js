import React, { useState } from 'react';

/**
 * Gallery component for displaying all book illustrations in a grid layout
 */
export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="image-gallery container mx-auto px-4">
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="overflow-hidden rounded-lg shadow-md border border-gray-200 aspect-square cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleImageClick(index)}
          >
            <div className="w-full h-full flex items-center justify-center p-2">
              <img 
                src={image} 
                alt={`Illustration ${index + 1}`} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            <div className="py-2 px-3 bg-white border-t border-gray-100">
              <p className="text-center text-sm font-medium text-gray-700">Page {index + 1}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Full-size Image Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[selectedImage]} 
              alt={`Illustration ${selectedImage + 1}`} 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-white bg-opacity-75 text-center">
              <p className="font-medium">Page {selectedImage + 1}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 