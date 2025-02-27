// src/app/teachers/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import TeacherForm from '@/components/forms/TeacherForm';

export default function EditTeacherPage({ params }: { params: { id: string } }) {
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${params.id}`);
        if (!response.ok) throw new Error('Teacher not found');
        const data = await response.json();
        setTeacher(data);
      } catch (error) {
        console.error('Error fetching teacher:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeacher();
  }, [params.id]);
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!teacher) return <div>ไม่พบข้อมูลอาจารย์</div>;
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">แก้ไขข้อมูลอาจารย์</h1>
      <TeacherForm initialData={teacher} isEditing />
    </div>
  );
}