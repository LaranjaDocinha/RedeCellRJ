import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Progress } from 'reactstrap'; // Assuming reactstrap Progress component
import './FileUpload.scss'; // Assuming a SCSS file for styling

const FileUpload = ({ onFileUpload, acceptedFileTypes = '.csv,.ofx', animationDelay = 0 }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        onFileUpload(file); // Call the parent's upload handler
      }
    }, 100);

    // In a real application, you would send the file to the server here
    // using fetch or axios, and update progress based on actual upload events.
    // Example:
    /*
    const formData = new FormData();
    formData.append('bankStatementFile', file);

    try {
      const response = await fetch('/api/bank-accounts/import-statement', {
        method: 'POST',
        body: formData,
        // You might need to implement a custom progress handler for fetch
        // or use a library like axios that provides progress events.
      });
      if (response.ok) {
        const result = await response.json();
        onFileUpload(result);
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        // Handle error
      }
    } catch (error) {
      console.error('Network error during upload:', error);
      // Handle network error
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
    */
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="file-upload-container"
    >
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="upload-progress">
            <p>Enviando arquivo...</p>
            <Progress value={uploadProgress}>{uploadProgress}%</Progress>
          </div>
        ) : (
          <>
            <i className="bx bx-cloud-upload upload-icon"></i>
            <p>Arraste e solte seu arquivo aqui, ou clique para selecionar</p>
            <p className="text-muted">Tipos de arquivo aceitos: {acceptedFileTypes}</p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FileUpload;