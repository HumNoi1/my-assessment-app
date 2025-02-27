// src/components/forms/FolderForm.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Teacher {
  teacher_id: string;
  name: string;
}

interface Subject {
  subject_id: string;
  subject_name: string;
}

interface FolderFormProps {
  initialData?: {
    folder_id?: string;
    folder_name: string;
    teacher_id: string;
    subject_id: string;
  };
  isEditing?: boolean;
}

export default function FolderForm({ initialData, isEditing = false }: FolderFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    folder_name: initialData?.folder_name || '',
    teacher_id: initialData?.teacher_id || '',
    subject_id: initialData?.subject_id || '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersResponse, subjectsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`)
        ]);
        
        const teachersData = await teachersResponse.json();
        const subjectsData = await subjectsResponse.json();
        
        setTeachers(teachersData);
        setSubjects(subjectsData);
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
        ? `${process.env.NEXT_PUBLIC_API_URL}/folders/${initialData?.folder_id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/folders`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.push('/folders');
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
        <label htmlFor="folder_name" className="block text-sm font-medium text-gray-700">
          ชื่อโฟลเดอร์
        </label>
        <input
          type="text"
          id="folder_name"
          name="folder_name"
          value={formData.folder_name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
          อาจารย์
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
      
      <div>
        <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700">
          วิชา
        </label>
        <select
          id="subject_id"
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">เลือกวิชา</option>
          {subjects.map(subject => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'อัพเดต' : 'สร้างโฟลเดอร์'}
        </Button>
      </div>
    </form>
  );
}