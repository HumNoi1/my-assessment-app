// src/app/answers/upload-key/page.tsx
'use client'

import { useState } from 'react';
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, X, Check, Info } from 'lucide-react';

export default function UploadAnswerKeyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/answers" className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4">
            <ArrowLeft size={20} className="mr-1" />
            <span>กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold">อัปโหลดเฉลย</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              
              <div>
                <label htmlFor="termId" className="block text-sm font-medium text-gray-700 mb-1">
                  เทอมเรียน <span className="text-red-500">*</span>
                </label>
                <select
                  id="termId"
                  name="termId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- เลือกเทอมเรียน --</option>
                  <option value="1">เทอม 1/2567</option>
                  <option value="2">เทอม 2/2567</option>
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
              <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1">
                คะแนนเต็ม <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="maxScore"
                name="maxScore"
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="เช่น 100"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดเฉลย
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับเฉลย"
              ></textarea>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6 flex">
              <Info size={20} className="text-blue-500 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">คำแนะนำในการอัปโหลดเฉลย</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>เฉลยควรมีรูปแบบที่ชัดเจนและละเอียด</li>
                  <li>ควรระบุเกณฑ์การให้คะแนนในแต่ละข้อให้ชัดเจน</li>
                  <li>หากมีหลายคำตอบที่ถูกต้อง ควรระบุทางเลือกทั้งหมด</li>
                  <li>สามารถแนบตัวอย่างคำตอบที่ดีเพื่อใช้เป็นแนวทางในการตรวจ</li>
                </ul>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อัปโหลดไฟล์เฉลย <span className="text-red-500">*</span>
              </label>
              <div 
                className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                
                {!selectedFile ? (
                  <div>
                    <div className="flex justify-center">
                      <Upload className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">คลิกเพื่อเลือกไฟล์เฉลยหรือลากไฟล์มาวางที่นี่</p>
                    <p className="mt-1 text-xs text-gray-500">รองรับไฟล์ PDF, DOC, DOCX, TXT ขนาดไม่เกิน 10MB</p>
                    <label 
                      htmlFor="fileUpload" 
                      className="mt-3 inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      เลือกไฟล์
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FileText size={20} className="text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={removeFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Check size={18} className="mr-2" />
                อัปโหลดเฉลย
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}