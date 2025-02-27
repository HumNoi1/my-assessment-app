// src/app/answer-keys/upload/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';

interface Subject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
}

interface Term {
  term_id: string;
  term_name: string;
}

export default function UploadAnswerKeyPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: '',
    term_id: '',
    file_content: '',
    file_name: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsResponse, termsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/terms`)
        ]);
        
        const subjectsData = await subjectsResponse.json();
        const termsData = await termsResponse.json();
        
        setSubjects(subjectsData);
        setTerms(termsData);
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
    
    if (!formData.subject_id || !formData.term_id || !formData.file_content) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: formData.file_name,
          content: formData.file_content,
          subject_id: formData.subject_id,
          term_id: formData.term_id
        }),
      });
      
      if (response.ok) {
        router.push('/answer-keys');
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading answer key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/answer-keys">
          <Button variant="outline" size="sm">← กลับไปหน้าไฟล์เฉลย</Button>
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">อัปโหลดไฟล์เฉลย</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-1">
              วิชา
            </label>
            <select
              id="subject_id"
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">เลือกวิชา</option>
              {subjects.map(subject => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_code} - {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="term_id" className="block text-sm font-medium text-gray-700 mb-1">
              เทอม
            </label>
            <select
              id="term_id"
              name="term_id"
              value={formData.term_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">เลือกเทอม</option>
              {terms.map(term => (
                <option key={term.term_id} value={term.term_id}>
                  {term.term_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ไฟล์เฉลย
          </label>
          <FileUpload 
            onFileRead={handleFileRead} 
            acceptedFileTypes={['.txt', '.doc', '.docx', '.pdf']} 
          />
        </div>
        
        <div>
          <label htmlFor="file_content" className="block text-sm font-medium text-gray-700 mb-1">
            เนื้อหาเฉลย
          </label>
          <textarea
            id="file_content"
            name="file_content"
            value={formData.file_content}
            onChange={handleChange}
            required
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="กรุณาระบุเนื้อหาเฉลย"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์เฉลย'}
          </Button>
        </div>
      </form>
    </div>
  );
}