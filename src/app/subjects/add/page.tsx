// src/app/subjects/add/page.tsx
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddSubjectPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/subjects" className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4">
            <ArrowLeft size={20} className="mr-1" />
            <span>กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold">เพิ่มวิชาเรียนใหม่</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subjectCode"
                  name="subjectCode"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น MATH101"
                />
              </div>
              
              <div>
                <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น คณิตศาสตร์พื้นฐาน"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                  ชั้นเรียน <span className="text-red-500">*</span>
                </label>
                <select
                  id="className"
                  name="className"
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
                <label htmlFor="termName" className="block text-sm font-medium text-gray-700 mb-1">
                  เทอมเรียน <span className="text-red-500">*</span>
                </label>
                <select
                  id="termName"
                  name="termName"
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
              <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                อาจารย์ผู้สอน <span className="text-red-500">*</span>
              </label>
              <select
                id="teacherId"
                name="teacherId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- เลือกอาจารย์ผู้สอน --</option>
                <option value="1">อาจารย์สมศรี สุขใจ</option>
                <option value="2">อาจารย์จอห์น สมิธ</option>
                <option value="3">อาจารย์ประพันธ์ คิดคำนวณ</option>
                <option value="4">อาจารย์วิทยา ทดลอง</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                คำอธิบายรายวิชา
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="คำอธิบายรายละเอียดของวิชา"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
                  หน่วยกิต
                </label>
                <input
                  type="number"
                  id="credits"
                  name="credits"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="จำนวนหน่วยกิต"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link 
                href="/subjects" 
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