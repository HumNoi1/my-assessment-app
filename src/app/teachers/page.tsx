// src/app/teachers/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Teacher {
  teacher_id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`);
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeachers();
  }, []);
  
  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบอาจารย์นี้ใช่หรือไม่?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTeachers(teachers.filter(teacher => teacher.teacher_id !== id));
      } else {
        const error = await response.json();
        alert(`ไม่สามารถลบได้: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายชื่ออาจารย์</h1>
        <Link href="/teachers/add">
          <Button>เพิ่มอาจารย์</Button>
        </Link>
      </div>
      
      {teachers.length === 0 ? (
        <p>ไม่พบข้อมูลอาจารย์</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-gray-200">ชื่อ</th>
                <th className="py-2 px-4 border-b border-gray-200">อีเมล</th>
                <th className="py-2 px-4 border-b border-gray-200">วันที่สร้าง</th>
                <th className="py-2 px-4 border-b border-gray-200">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.teacher_id}>
                  <td className="py-2 px-4 border-b border-gray-200">{teacher.name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{teacher.email}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(teacher.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <Link href={`/teachers/${teacher.teacher_id}`}>
                        <Button variant="outline" size="sm">แก้ไข</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(teacher.teacher_id)}
                      >
                        ลบ
                      </Button>
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