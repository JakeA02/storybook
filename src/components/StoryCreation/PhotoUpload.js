import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useStory } from "../../context/index";
import { getImage } from "../../utils";
import { IMAGE_KEYS } from "../../context/constants";
import { Loader2 } from "lucide-react";

export default function PhotoUpload() {
  const { handleBack, handlePhotoSubmit } = useStory(); // Assuming these functions are passed correctly
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); // State for the error message
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkForUserPhoto = async () => {
      setIsLoading(true);
      try {
        const photo = await getImage(IMAGE_KEYS.USER_PHOTO);
        if (photo) {
          setPhoto(photo);
          const reader = new FileReader();
          reader.onload = () => {
            setPreviewUrl(reader.result);
            setIsLoading(false);
          };
          reader.onerror = () => {
            setErrorMessage("Error loading saved photo");
            setIsLoading(false);
          };
          reader.readAsDataURL(photo);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking for user photo:", error);
        setErrorMessage("Error checking for saved photo");
        setIsLoading(false);
      }
    };
    checkForUserPhoto();
  }, []);

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setIsLoading(true);
      setErrorMessage(null);
      setPhoto(file);
      setPreviewUrl(null);

      const reader = new FileReader();

      reader.onload = () => {
        setPreviewUrl(reader.result);
        setIsLoading(false); // Set loading to false when reading is done
      };

      reader.onerror = () => {
        console.error("FileReader error reading file.");
        setErrorMessage("Could not read this file. Please try again.");
        setPreviewUrl(null);
        setPhoto(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setIsLoading(false); // Set loading to false on error as well
      };

      reader.readAsDataURL(file);
    } else if (file) {
      setErrorMessage("Please select an image file (JPG, PNG, etc.).");
      setPreviewUrl(null);
      setPhoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsLoading(false); // Keep this here for immediate feedback on invalid file type
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    // Don't trigger if there's already a preview, allow changing via preview click maybe?
    // Or always trigger, letting user replace current. Current code always triggers.
    fileInputRef.current?.click();
  };

  const handleImageError = () => {
    setErrorMessage(
      "Could not display preview. Image might be invalid or corrupted. Please try another."
    );
    setPreviewUrl(null);
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreviewClick = () => {
    // Allow clicking the preview area (including the image) to change the image
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (photo && !errorMessage) {
      // Ensure no error before submitting
      handlePhotoSubmit(photo);
    }
  };

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload a Photo</h2>
      <p className="text-center mb-8 font-story">
        Upload a clear photo of your child
      </p>

      <div
        className={`upload-area ${previewUrl ? "has-preview" : ""} ${
          errorMessage ? "border-red-500" : "border-dashed border-gray-300"
        } p-6 rounded-lg text-center cursor-pointer hover:border-gray-400 transition-colors`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!previewUrl ? triggerFileInput : handlePreviewClick} // Only trigger empty area click if no preview, else use preview click handler
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : previewUrl ? (
          <div className="preview-container">
            <img
              src={previewUrl}
              alt="Preview"
              width={200}
              height={200}
              className="preview-image inline-block max-w-full max-h-48 object-contain" // Added some basic styling
              onError={handleImageError}
            />
            <p className="mt-2 text-sm text-muted">Click image to change</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="mb-4 inline-block">
              {/* Wrap Image for centering */}
              <Image
                src="/images/upload-cloud.svg" // Ensure this path is correct
                width={64}
                height={64}
                alt="Upload"
                className="mx-auto" // Still use mx-auto within the inline-block/div
              />
            </div>
            <p className="text-muted mt-2">Drag & drop a photo here</p>
            <p className="text-muted">or click to browse</p>
            <p className="text-xs text-muted mt-2">
              Supports JPG, PNG files
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/gif, image/webp" // More specific accept
          className="hidden"
          aria-label="File upload input"
        />
      </div>

      {/* Display Error Message Below Upload Area */}
      {errorMessage && (
        <p className="text-red-500 text-sm mt-3 text-center font-medium">
          {errorMessage}
        </p>
      )}

      <p className="text-center text-muted text-sm my-6">
        Images are not shared or stored anywhere.
      </p>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!photo || !!errorMessage} // Disable if no photo or if there's an error
          className={`px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white transition-transform duration-200 shadow-md font-medium ${
            !photo || errorMessage
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
