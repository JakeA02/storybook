import { useState, useRef } from "react";
import Image from "next/image";
import { useStory } from "../../context/StoryContext";

export default function PhotoUpload() {
  const { handleBack, handlePhotoSubmit } = useStory();
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
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
      if (file.type.startsWith("image/")) {
        setPhoto(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = () => {
    if (photo) {
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
        className={`upload-area ${previewUrl ? "has-preview" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <div className="preview-container">
            <img
              src={previewUrl}
              alt="Preview"
              width={200}
              height={200}
              className="preview-image"
            />
            <p className="mt-2 text-sm">Click to change image</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="mb-4">
              <Image
                src="/images/upload-cloud.svg"
                width={64}
                height={64}
                alt="Upload"
                className="mx-auto"
              />
            </div>
            <p>Drag & drop a photo here or click to browse</p>
            <p className="text-xs text-muted mt-2">Supports JPG, PNG files</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      <p className="text-center m-6">
        Images are not shared or stored anywhere.
      </p>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!photo}
          className={`px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white transition-transform duration-200 shadow-md font-medium ${
            !photo ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
