// src/components/FileUpload.tsx
'use client'

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, UploadIcon } from 'lucide-react';

interface FileUploadProps {
  onFileRead: (file: File, content: string) => void;
  acceptedFileTypes: string[];
}

export function FileUpload({ onFileRead, acceptedFileTypes }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setIsProcessing(true);
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileRead(file, content);
        setIsProcessing(false);
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        setIsProcessing(false);
      };
      
      reader.readAsText(file);
    }
  }, [onFileRead]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1
  });
  
  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <UploadIcon className={`h-8 w-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          {isProcessing ? (
            <p className="text-sm text-gray-500">กำลังอ่านไฟล์...</p>
          ) : selectedFile ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium">ไฟล์ที่เลือก: {selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
              <p className="text-xs text-blue-500 mt-1">คลิกหรือลากไฟล์ใหม่เพื่อเปลี่ยน</p>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <p>ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="mt-1 text-xs">
                รองรับไฟล์: {acceptedFileTypes.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {selectedFile && (
        <div className="flex items-center p-2 bg-gray-50 border rounded-md">
          <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm font-medium truncate">{selectedFile.name}</span>
          <span className="text-xs text-gray-500 ml-auto">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </span>
        </div>
      )}
    </div>
  );
}