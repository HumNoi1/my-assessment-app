// src/components/forms/ClassForm.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Teacher {
  teacher_id: string;
  name: string;
}

interface ClassFormProps {
  initialData?: {
    class_id?: string;
    class_name: string;
    academic_year: string;
    teacher_id: string;
  };
  isEditing?: boolean;
}

export default function ClassForm({ initialData, isEditing = false }: ClassFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    class_name: initialData?.class_name || '',
    academic_year: initialData?.academic_year || '',
    teacher_id: initialData?.teacher_id || '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        ? `${process.env.NEXT_PUBLIC_API_URL}/classes/${initialData?.class_id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/classes`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.push('/classes');
        router.refresh();
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
        <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">
          ชื่อชั้นเรียน
        </label>
        <input
          type="text"
          id="class_name"
          name="class_name"
          value={formData.class_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700">
          ปีการศึกษา
        </label>
        <input
          type="text"
          id="academic_year"
          name="academic_year"
          value={formData.academic_year}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
          อาจารย์ประจำชั้น
        </label>
        <select
          id="teacher_id"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">เลือกอาจารย์</option>
          {teachers.map(teacher => (
            <option key={teacher.teacher_id} value={teacher.teacher_id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'อัพเดต' : 'บันทึก'}
        </Button>
      </div>
    </form>
  );
}