// src/app/student-answers/upload/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';

interface Student {
  student_id: string;
  name: string;
}

interface AnswerKey {
  answer_key_id: string;
  file_name: string;
  subject: {
    subject_name: string;
  };
}

interface Folder {
  folder_id: string;
  folder_name: string;
}

export default function UploadStudentAnswerPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    answer_key_id: '',
    folder_id: '',
    file_content: '',
    file_name: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, answerKeysResponse, foldersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer-keys`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders`)
        ]);
        
        const studentsData = await studentsResponse.json();
        const answerKeysData = await answerKeysResponse.json();
        const foldersData = await foldersResponse.json();
        
        setStudents(studentsData);
        setAnswerKeys(answerKeysData);
        setFolders(foldersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFileRead = (file: File, content: string) => {
    setFormData({
      ...formData,
      file_name: file.name,
      file_content: content
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.answer_key_id || !formData.folder_id || !formData.file_content) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: formData.file_name,
          content: formData.file_content,
          student_id: formData.student_id,
          answer_key_id: formData.answer_key_id,
          folder_id: formData.folder_id
        }),
      });
      
      if (response.ok) {
        router.push('/student-answers');
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading student answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/student-answers">
          <Button variant="outline" size="sm">← กลับไปหน้าคำตอบนักเรียน</Button>
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">อัปโหลดคำตอบนักเรียน</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
              นักเรียน
            </label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">เลือกนักเรียน</option>
              {students.map(student => (
                <option key={student.student_id} value={student.student_id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="answer_key_id" className="block text-sm font-medium text-gray-700 mb-1">
              ไฟล์เฉลย
            </label>
            <select
              id="answer_key_id"
              name="answer_key_id"
              value={formData.answer_key_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">เลือกไฟล์เฉลย</option>
              {answerKeys.map(answerKey => (
                <option key={answerKey.answer_key_id} value={answerKey.answer_key_id}>
                  {answerKey.file_name} - {answerKey.subject?.subject_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="folder_id" className="block text-sm font-medium text-gray-700 mb-1">
              โฟลเดอร์
            </label>
            <select
              id="folder_id"
              name="folder_id"
              value={formData.folder_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">เลือกโฟลเดอร์</option>
              {folders.map(folder => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  {folder.folder_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ไฟล์คำตอบนักเรียน
          </label>
          <FileUpload 
            onFileRead={handleFileRead} 
            acceptedFileTypes={['.txt', '.doc', '.docx', '.pdf']} 
          />
        </div>
        
        <div>
          <label htmlFor="file_content" className="block text-sm font-medium text-gray-700 mb-1">
            เนื้อหาคำตอบ
          </label>
          <textarea
            id="file_content"
            name="file_content"
            value={formData.file_content}
            onChange={handleChange}
            required
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="กรุณาระบุเนื้อหาคำตอบ"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังอัปโหลด...' : 'อัปโหลดคำตอบนักเรียน'}
          </Button>
        </div>
      </form>
    </div>
  );
}