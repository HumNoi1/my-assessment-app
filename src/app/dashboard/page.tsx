// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserIcon, 
  BookOpenIcon, 
  FolderIcon, 
  FileText, 
  GraduationCapIcon 
} from 'lucide-react';

interface DashboardStat {
  title: string;
  value: number;
  icon: React.ReactNode;
  path: string;
  bgColor: string;
}

interface RecentAssessment {
  assessment_id: string;
  student_answer: {
    student: {
      name: string;
    };
    file_name: string;
  };
  score?: number;
  is_approved: boolean;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [pendingAssessments, setPendingAssessments] = useState<RecentAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ในโปรเจกต์จริง ควรมี API endpoint เฉพาะสำหรับข้อมูล dashboard
        // นี่เป็นแค่ตัวอย่างการเรียกข้อมูลจากหลาย endpoint
        
        const [
          teachersResponse,
          classesResponse,
          studentsResponse,
          foldersResponse,
          pendingResponse
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/assessments?is_approved=false`)
        ]);
        
        const teachersData = await teachersResponse.json();
        const classesData = await classesResponse.json();
        const studentsData = await studentsResponse.json();
        const foldersData = await foldersResponse.json();
        const pendingData = await pendingResponse.json();
        
        setStats([
          {
            title: 'อาจารย์',
            value: teachersData.length,
            icon: <UserIcon className="h-6 w-6" />,
            path: '/teachers',
            bgColor: 'bg-blue-500'
          },
          {
            title: 'ชั้นเรียน',
            value: classesData.length,
            icon: <GraduationCapIcon className="h-6 w-6" />,
            path: '/classes',
            bgColor: 'bg-green-500'
          },
          {
            title: 'นักเรียน',
            value: studentsData.length,
            icon: <UserIcon className="h-6 w-6" />,
            path: '/students',
            bgColor: 'bg-purple-500'
          },
          {
            title: 'วิชา',
            value: classesData.length, // สมมติว่าหาจาก class
            icon: <BookOpenIcon className="h-6 w-6" />,
            path: '/subjects',
            bgColor: 'bg-yellow-500'
          },
          {
            title: 'โฟลเดอร์งาน',
            value: foldersData.length,
            icon: <FolderIcon className="h-6 w-6" />,
            path: '/folders',
            bgColor: 'bg-red-500'
          },
          {
            title: 'รอตรวจ',
            value: pendingData.length,
            icon: <FileText className="h-6 w-6" />,
            path: '/assessments',
            bgColor: 'bg-orange-500'
          },
        ]);
        
        setPendingAssessments(pendingData.slice(0, 5)); // แสดงแค่ 5 รายการล่าสุด
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">แผงควบคุม</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.path}>
            <div className={`${stat.bgColor} text-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div>{stat.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Pending Assessments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">งานที่รอตรวจล่าสุด</h2>
        
        {pendingAssessments.length === 0 ? (
          <p className="text-gray-500">ไม่มีงานที่รอการตรวจ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">นักเรียน</th>
                  <th className="py-2 px-4 text-left">ชื่อไฟล์</th>
                  <th className="py-2 px-4 text-left">วันที่</th>
                  <th className="py-2 px-4 text-left">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {pendingAssessments.map((assessment) => (
                  <tr key={assessment.assessment_id} className="border-b">
                    <td className="py-2 px-4">{assessment.student_answer.student.name}</td>
                    <td className="py-2 px-4">{assessment.student_answer.file_name}</td>
                    <td className="py-2 px-4">{new Date(assessment.created_at).toLocaleDateString('th-TH')}</td>
                    <td className="py-2 px-4">
                      <Link href={`/assessment/${assessment.assessment_id}`}>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                          ตรวจ
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {pendingAssessments.length > 0 && (
          <div className="mt-4 text-right">
            <Link href="/assessments">
              <button className="text-blue-500 hover:underline">ดูทั้งหมด</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}