// src/app/answers/upload-answer/page.tsx
'use client'

import { useState } from 'react';
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react';

export default function UploadAnswerPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/answers" className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4">
            <ArrowLeft size={20} className="mr-1" />
            <span>กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold">อัปโหลดคำตอบนักเรียน</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                  ชั้นเรียน <span className="text-red-500">*</span>
                </label>
                <select
                  id="classId"
                  name="classId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- เลือกชั้นเรียน --</option>
                  <option value="1">ม.1/1</option>
                  <option value="2">ม.1/2</option>
                  <option value="3">ม.2/1</option>
                  <option value="4">ม.3/1</option>
                  <option value="5">ม.3/2</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
                  วิชา <span className="text-red-500">*</span>
                </label>
                <select
                  id="subjectId"
                  name="subjectId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- เลือกวิชา --</option>
                  <option value="1">ภาษาไทย</option>
                  <option value="2">ภาษาอังกฤษ</option>
                  <option value="3">คณิตศาสตร์</option>
                  <option value="4">วิทยาศาสตร์</option>
                  <option value="5">สังคมศึกษา</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 mb-1">
                โฟลเดอร์ <span className="text-red-500">*</span>
              </label>
              <select
                id="folderId"
                name="folderId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- เลือกโฟลเดอร์ --</option>
                <option value="1">แบบฝึกหัดกลางภาค</option>
                <option value="2">งานเขียนเรียงความ</option>
                <option value="3">โจทย์คณิตศาสตร์</option>
                <option value="4">รายงานการทดลอง</option>
                <option value="5">แบบทดสอบปลายภาค</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                นักเรียน <span className="text-red-500">*</span>
              </label>
              <select
                id="studentId"
                name="studentId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- เลือกนักเรียน --</option>
                <option value="1">นายสมชาย ใจดี (10001)</option>
                <option value="2">นางสาวสมหญิง รักเรียน (10002)</option>
                <option value="3">นายวิชัย เรียนดี (10003)</option>
                <option value="4">นางสาวมนัสนันท์ สุขใจ (10004)</option>
                <option value="5">นายภูมิ ภูมิใจ (10005)</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อัปโหลดไฟล์คำตอบ <span className="text-red-500">*</span>
              </label>
              <div 
                className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                
                {selectedFiles.length === 0 ? (
                  <div>
                    <div className="flex justify-center">
                      <Upload className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวางที่นี่</p>
                    <p className="mt-1 text-xs text-gray-500">รองรับไฟล์ PDF, DOC, DOCX, TXT ขนาดไม่เกิน 10MB</p>
                    <label 
                      htmlFor="fileUpload" 
                      className="mt-3 inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      เลือกไฟล์
                    </label>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-2 mb-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText size={20} className="text-indigo-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label 
                      htmlFor="fileUpload" 
                      className="mt-2 inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      เพิ่มไฟล์เพิ่มเติม
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link 
                href="/answers" 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </Link>
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                <Check size={18} className="mr-2" />
                อัปโหลด
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}