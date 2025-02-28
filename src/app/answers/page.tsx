// src/app/answers/page.tsx
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { FileText, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AnswersPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">คำตอบและเฉลย</h1>
          <div className="flex space-x-2">
            <Link href="/answers/upload-answer" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center">
              <FileText size={20} className="mr-2" />
              อัปโหลดคำตอบนักเรียน
            </Link>
            <Link href="/answers/upload-key" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
              <FileText size={20} className="mr-2" />
              อัปโหลดเฉลย
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ตรวจแล้ว</p>
              <p className="text-2xl font-bold">48</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">รอการตรวจ</p>
              <p className="text-2xl font-bold">23</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">มีปัญหา</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input 
                type="search" 
                className="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="ค้นหาคำตอบ..." 
              />
            </div>
            
            <div className="flex space-x-2">
              <select className="p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">ทุกวิชา</option>
                <option value="thai">ภาษาไทย</option>
                <option value="eng">ภาษาอังกฤษ</option>
                <option value="math">คณิตศาสตร์</option>
                <option value="sci">วิทยาศาสตร์</option>
              </select>
              
              <select className="p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">ทุกสถานะ</option>
                <option value="checked">ตรวจแล้ว</option>
                <option value="pending">รอการตรวจ</option>
                <option value="issue">มีปัญหา</option>
              </select>
              
              <select className="p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">ทุกชั้นเรียน</option>
                <option value="m1-1">ม.1/1</option>
                <option value="m1-2">ม.1/2</option>
                <option value="m2-1">ม.2/1</option>
                <option value="m3-1">ม.3/1</option>
                <option value="m3-2">ม.3/2</option>
              </select>
            </div>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  นักเรียน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชั้นเรียน/วิชา
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  โฟลเดอร์
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่ส่ง
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คะแนน
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {answers.map((answer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-gray-600">{answer.student.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{answer.student}</div>
                        <div className="text-sm text-gray-500">{answer.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{answer.class}</div>
                    <div className="text-sm text-gray-500">{answer.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{answer.folder}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{answer.submittedDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${answer.status === 'ตรวจแล้ว' ? 'bg-green-100 text-green-800' : 
                          answer.status === 'รอการตรวจ' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}
                    >
                      {answer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {answer.score ? `${answer.score}/100` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/answers/check/${index}`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md">
                      {answer.status === 'ตรวจแล้ว' ? 'ดูผล' : 'ตรวจ'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                แสดง <span className="font-medium">1</span> ถึง <span className="font-medium">10</span> จาก <span className="font-medium">76</span> รายการ
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

// ข้อมูลตัวอย่างสำหรับคำตอบ
const answers = [
  { student: 'นายสมชาย ใจดี', studentId: '10001', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'ตรวจแล้ว', score: 85 },
  { student: 'นางสาวสมหญิง รักเรียน', studentId: '10002', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'ตรวจแล้ว', score: 92 },
  { student: 'นายวิชัย เรียนดี', studentId: '10003', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'รอการตรวจ', score: null },
  { student: 'นางสาวมนัสนันท์ สุขใจ', studentId: '10004', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'รอการตรวจ', score: null },
  { student: 'นายภูมิ ภูมิใจ', studentId: '10005', class: 'ม.1/2', subject: 'คณิตศาสตร์', folder: 'โจทย์คณิตศาสตร์', submittedDate: '24 ก.พ. 2567', status: 'มีปัญหา', score: null },
  { student: 'นางสาวแก้ว ใสสะอาด', studentId: '10006', class: 'ม.1/2', subject: 'คณิตศาสตร์', folder: 'โจทย์คณิตศาสตร์', submittedDate: '24 ก.พ. 2567', status: 'ตรวจแล้ว', score: 78 },
  { student: 'นายณัฐ ฉลาด', studentId: '10007', class: 'ม.2/1', subject: 'วิทยาศาสตร์', folder: 'รายงานการทดลอง', submittedDate: '23 ก.พ. 2567', status: 'ตรวจแล้ว', score: 95 },
  { student: 'นางสาวพิมพ์ สวยงาม', studentId: '10008', class: 'ม.2/1', subject: 'วิทยาศาสตร์', folder: 'รายงานการทดลอง', submittedDate: '23 ก.พ. 2567', status: 'รอการตรวจ', score: null },
  { student: 'นายนิติ ถูกต้อง', studentId: '10009', class: 'ม.3/1', subject: 'สังคมศึกษา', folder: 'แบบทดสอบปลายภาค', submittedDate: '22 ก.พ. 2567', status: 'ตรวจแล้ว', score: 88 },
  { student: 'นางสาวกนกพร พรพรรณ', studentId: '10010', class: 'ม.3/2', subject: 'ภาษาอังกฤษ', folder: 'งานเขียนเรียงความ', submittedDate: '21 ก.พ. 2567', status: 'รอการตรวจ', score: null },
];