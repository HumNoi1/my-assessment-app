// components/FileUpload.tsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  acceptedFileTypes: string;
  label: string;
}

export default function FileUpload({ 
  onFileAccepted, 
  acceptedFileTypes, 
  label 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: { [acceptedFileTypes]: [] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        try {
          await onFileAccepted(acceptedFiles[0]);
        } finally {
          setIsUploading(false);
        }
      }
    }
  });

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <div 
        {...getRootProps()} 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p className="text-gray-500">กำลังอัปโหลดไฟล์...</p>
        ) : (
          <p className="text-gray-500">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
        )}
      </div>
    </div>
  );
}