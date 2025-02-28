// src/app/folders/add/page.tsx
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function AddFolderPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/folders" className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4">
            <ArrowLeft size={20} className="mr-1" />
            <span>กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold">สร้างโฟลเดอร์ใหม่</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form>
            <div className="mb-6">
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อโฟลเดอร์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="folderName"
                name="folderName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="เช่น แบบฝึกหัดกลางภาค"
              />
            </div>
            
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
            </div>
            
            <div className="mb-6">
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
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                คำอธิบาย
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="คำอธิบายเกี่ยวกับโฟลเดอร์นี้"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อัปโหลดไฟล์เฉลย (ถ้ามี)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <p className="mt-2 text-sm text-gray-600">คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวางที่นี่</p>
                <p className="mt-1 text-xs text-gray-500">รองรับไฟล์ PDF, DOC, DOCX, TXT ขนาดไม่เกิน 10MB</p>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" />
                <button 
                  type="button" 
                  className="mt-3 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  เลือกไฟล์
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link 
                href="/folders" 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </Link>
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                <Save size={18} className="mr-2" />
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}