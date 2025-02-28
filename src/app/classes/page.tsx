// src/app/classes/page.tsx
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { Plus, Edit, Trash, Users } from 'lucide-react';

export default function ClassesPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ชั้นเรียน</h1>
          <Link href="classes/add" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus size={20} className="mr-2" />
            เพิ่มชั้นเรียนใหม่
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="search" 
                className="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="ค้นหาชั้นเรียน..." 
              />
            </div>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อชั้นเรียน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ปีการศึกษา
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนนักเรียน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วิชาที่สอน
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((classItem, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{classItem.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{classItem.studentCount} คน</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{classItem.subjects} วิชา</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Edit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                แสดง <span className="font-medium">1</span> ถึง <span className="font-medium">5</span> จาก <span className="font-medium">12</span> รายการ
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-500">
                  ก่อนหน้า
                </button>
                <button className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white">
                  1
                </button>
                <button className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700">
                  2
                </button>
                <button className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700">
                  3
                </button>
                <button className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700">
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ข้อมูลตัวอย่างสำหรับชั้นเรียน
const classes = [
  { name: 'ม.1/1', year: '2567', studentCount: 35, subjects: 8 },
  { name: 'ม.1/2', year: '2567', studentCount: 32, subjects: 8 },
  { name: 'ม.2/1', year: '2567', studentCount: 30, subjects: 9 },
  { name: 'ม.3/1', year: '2567', studentCount: 28, subjects: 9 },
  { name: 'ม.3/2', year: '2567', studentCount: 27, subjects: 9 },
];