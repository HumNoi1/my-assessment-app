// src/app/subjects/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Subject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher: { name: string };
  class: { class_name: string };
  created_at: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`);
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายวิชา</h1>
        <Link href="/subjects/add">
          <Button>เพิ่มวิชา</Button>
        </Link>
      </div>
      
      {subjects.length === 0 ? (
        <p>ไม่พบข้อมูลวิชา</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-gray-200">รหัสวิชา</th>
                <th className="py-2 px-4 border-b border-gray-200">ชื่อวิชา</th>
                <th className="py-2 px-4 border-b border-gray-200">อาจารย์</th>
                <th className="py-2 px-4 border-b border-gray-200">ชั้นเรียน</th>
                <th className="py-2 px-4 border-b border-gray-200">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.subject_id}>
                  <td className="py-2 px-4 border-b border-gray-200">{subject.subject_code}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{subject.subject_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{subject.teacher?.name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{subject.class?.class_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <Link href={`/subjects/${subject.subject_id}`}>
                        <Button variant="outline" size="sm">แก้ไข</Button>
                      </Link>
                      <Link href={`/subjects/${subject.subject_id}/terms`}>
                        <Button variant="outline" size="sm">เทอม</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}