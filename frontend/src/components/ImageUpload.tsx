import React, { useState } from 'react';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, currentImageUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/uploads', {
        // Assuming proxy is set up for /uploads to backend
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onImageUpload(data.url);
      setUploading(false);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-md shadow-sm bg-white">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-normal
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
      />
      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Image Preview"
            className="max-w-xs max-h-48 object-contain rounded-md"
          />
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-normal text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

