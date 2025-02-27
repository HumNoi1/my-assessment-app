// src/components/forms/SubjectForm.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Teacher {
  teacher_id: string;
  name: string;
}

interface Class {
  class_id: string;
  class_name: string;
}

interface SubjectFormProps {
  initialData?: {
    subject_id?: string;
    subject_name: string;
    subject_code: string;
    teacher_id: string;
    class_id: string;
  };
  isEditing?: boolean;
}

export default function SubjectForm({ initialData, isEditing = false }: SubjectFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject_name: initialData?.subject_name || '',
    subject_code: initialData?.subject_code || '',
    teacher_id: initialData?.teacher_id || '',
    class_id: initialData?.class_id || '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersResponse, classesResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`)
        ]);
        
        const teachersData = await teachersResponse.json();
        const classesData = await classesResponse.json();
        
        setTeachers(teachersData);
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/subjects/${initialData?.subject_id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/subjects`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.push('/subjects');
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="subject_code" className="block text-sm font-medium">รหัสวิชา</label>
        <input
          type="text"
          id="subject_code"
          name="subject_code"
          value={formData.subject_code}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="subject_name" className="block text-sm font-medium">ชื่อวิชา</label>
        <input
          type="text"
          id="subject_name"
          name="subject_name"
          value={formData.subject_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="teacher_id" className="block text-sm font-medium">อาจารย์</label>
        <select
          id="teacher_id"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">เลือกอาจารย์</option>
          {teachers.map(teacher => (
            <option key={teacher.teacher_id} value={teacher.teacher_id}>{teacher.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="class_id" className="block text-sm font-medium">ชั้นเรียน</label>
        <select
          id="class_id"
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">เลือกชั้นเรียน</option>
          {classes.map(cls => (
            <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'อัพเดต' : 'บันทึก'}
        </Button>
      </div>
    </form>
  );
}