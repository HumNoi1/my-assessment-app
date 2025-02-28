// src/app/classes/add/page.tsx
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddClassPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/classes" className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4">
            <ArrowLeft size={20} className="mr-1" />
            <span>กลับ</span>
          </Link>
          <h1 className="text-2xl font-bold">เพิ่มชั้นเรียนใหม่</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อชั้นเรียน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น ม.1/1"
                />
              </div>
              
              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                  ปีการศึกษา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="academicYear"
                  name="academicYear"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น 2567"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="advisorTeacher" className="block text-sm font-medium text-gray-700 mb-1">
                อาจารย์ที่ปรึกษา
              </label>
              <select
                id="advisorTeacher"
                name="advisorTeacher"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- เลือกอาจารย์ที่ปรึกษา --</option>
                <option value="1">อาจารย์สมชาย ใจดี</option>
                <option value="2">อาจารย์สมหญิง รักเรียน</option>
                <option value="3">อาจารย์วิชัย เก่งกล้า</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับชั้นเรียน (ถ้ามี)"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนนักเรียน
                </label>
                <input
                  type="number"
                  id="studentCount"
                  name="studentCount"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="จำนวนนักเรียนในชั้นเรียน"
                />
              </div>
              
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link 
                href="/classes" 
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