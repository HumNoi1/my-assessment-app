// src/app/classes/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Class {
  class_id: string;
  class_name: string;
  academic_year: string;
  teacher: {
    name: string;
  };
  created_at: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`);
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClasses();
  }, []);
  
  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบชั้นเรียนนี้ใช่หรือไม่?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setClasses(classes.filter(cls => cls.class_id !== id));
      } else {
        const error = await response.json();
        alert(`ไม่สามารถลบได้: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายการชั้นเรียน</h1>
        <Link href="/classes/add">
          <Button>เพิ่มชั้นเรียน</Button>
        </Link>
      </div>
      
      {classes.length === 0 ? (
        <p>ไม่พบข้อมูลชั้นเรียน</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-gray-200">ชื่อชั้นเรียน</th>
                <th className="py-2 px-4 border-b border-gray-200">ปีการศึกษา</th>
                <th className="py-2 px-4 border-b border-gray-200">อาจารย์ประจำชั้น</th>
                <th className="py-2 px-4 border-b border-gray-200">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.class_id}>
                  <td className="py-2 px-4 border-b border-gray-200">{cls.class_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{cls.academic_year}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{cls.teacher?.name || 'ไม่ระบุ'}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <Link href={`/classes/${cls.class_id}`}>
                        <Button variant="outline" size="sm">แก้ไข</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(cls.class_id)}
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