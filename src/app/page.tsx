// src/app/page.tsx
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { FileText, Book, Users, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ยินดีต้อนรับสู่ระบบผู้ช่วยตรวจข้อสอบอัตนัย</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="ชั้นเรียน" 
            value="5" 
            icon={<Users size={24} className="text-blue-500" />} 
            change="+2 เพิ่มเติม" 
            isIncrease={true} 
          />
          <StatsCard 
            title="วิชาเรียน" 
            value="12" 
            icon={<Book size={24} className="text-green-500" />} 
            change="+3 เพิ่มเติม" 
            isIncrease={true} 
          />
          <StatsCard 
            title="เทอมเรียน" 
            value="2" 
            icon={<Calendar size={24} className="text-purple-500" />} 
            change="ปัจจุบัน" 
            isIncrease={false} 
          />
          <StatsCard 
            title="ไฟล์คำตอบ" 
            value="87" 
            icon={<FileText size={24} className="text-orange-500" />} 
            change="+15 ไฟล์ใหม่" 
            isIncrease={true} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">งานตรวจล่าสุด</h2>
            <div className="space-y-4">
              {recentAssessments.map((assessment, index) => (
                <div key={index} className="flex items-center p-3 border-b last:border-b-0">
                  <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center mr-4">
                    <FileText size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{assessment.name}</p>
                    <p className="text-sm text-gray-500">{assessment.subject} • {assessment.date}</p>
                  </div>
                  <div className={`text-sm font-medium ${assessment.status === 'ตรวจแล้ว' ? 'text-green-600' : 'text-amber-600'}`}>
                    {assessment.status}
                  </div>
                </div>
              ))}
              <Link href="/answers" className="block text-center text-indigo-600 hover:text-indigo-800 mt-4">
                ดูทั้งหมด
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">คะแนนเฉลี่ยรายวิชา</h2>
            <div className="space-y-4">
              {subjectScores.map((subject, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{subject.name}</span>
                    <span className="font-medium">{subject.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <Link href="/subjects" className="block text-center text-indigo-600 hover:text-indigo-800 mt-4">
                ดูทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Component สำหรับแสดงการ์ดสถิติ
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  isIncrease: boolean;
}

function StatsCard({ title, value, icon, change, isIncrease }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <div className={`mt-2 flex items-center text-sm ${isIncrease ? 'text-green-600' : 'text-gray-500'}`}>
        {change}
      </div>
    </div>
  );
}

// ข้อมูลตัวอย่างสำหรับงานตรวจล่าสุด
const recentAssessments = [
  { name: 'แบบฝึกหัด 3 - ภาษาไทย', subject: 'ภาษาไทย', date: '28 ก.พ. 2025', status: 'ตรวจแล้ว' },
  { name: 'แบบทดสอบกลางภาค', subject: 'คณิตศาสตร์', date: '27 ก.พ. 2025', status: 'ตรวจแล้ว' },
  { name: 'รายงานวิทยาศาสตร์', subject: 'วิทยาศาสตร์', date: '25 ก.พ. 2025', status: 'รอตรวจ' },
  { name: 'เรียงความภาษาอังกฤษ', subject: 'ภาษาอังกฤษ', date: '23 ก.พ. 2025', status: 'ตรวจแล้ว' },
];

// ข้อมูลตัวอย่างสำหรับคะแนนเฉลี่ยรายวิชา
const subjectScores = [
  { name: 'ภาษาไทย', score: 85 },
  { name: 'คณิตศาสตร์', score: 78 },
  { name: 'วิทยาศาสตร์', score: 92 },
  { name: 'ภาษาอังกฤษ', score: 75 },
  { name: 'สังคมศึกษา', score: 88 },
];