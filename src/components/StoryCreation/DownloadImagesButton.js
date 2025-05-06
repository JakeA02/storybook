import React, { useState } from 'react';
import { Download } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Button component that allows downloading all illustrations as a zip file
 */
export default function DownloadImagesButton({ illustrations, storyTitle }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!illustrations || illustrations.length === 0 || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("illustrations");
      
      // Download each image and add it to the zip
      const imagePromises = illustrations.map(async (imageUrl, index) => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Extract file extension from the content type or use .png as default
          const contentType = response.headers.get('content-type') || 'image/png';
          const extension = contentType.split('/')[1] || 'png';
          
          // Add file to zip with page number
          folder.file(`page_${index + 1}.${extension}`, blob);
        } catch (error) {
          console.error(`Error downloading image ${index + 1}:`, error);
        }
      });
      
      // Wait for all images to be processed
      await Promise.all(imagePromises);
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create a safe filename from the story title
      const safeTitle = (storyTitle || 'story')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
        
      // Save the zip file
      saveAs(zipBlob, `${safeTitle}_illustrations.zip`);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('There was an error downloading the illustrations. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!illustrations || illustrations.length === 0 || isDownloading}
      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white rounded-md px-4 py-2 transition-colors"
    >
      {isDownloading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Download All Images</span>
        </>
      )}
    </button>
  );
} 