// src/app/answer-keys/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileTextIcon, PlusIcon, DownloadIcon, TrashIcon } from 'lucide-react';

interface AnswerKey {
  answer_key_id: string;
  file_name: string;
  subject: {
    subject_name: string;
    subject_code: string;
  };
  term: {
    term_name: string;
  };
  created_at: string;
}

export default function AnswerKeysPage() {
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAnswerKeys = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer-keys`);
        const data = await response.json();
        setAnswerKeys(data);
      } catch (error) {
        console.error('Error fetching answer keys:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnswerKeys();
  }, []);
  
  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบไฟล์เฉลยนี้ใช่หรือไม่?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer-keys/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAnswerKeys(answerKeys.filter(key => key.answer_key_id !== id));
      } else {
        const error = await response.json();
        alert(`ไม่สามารถลบได้: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting answer key:', error);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ไฟล์เฉลย</h1>
        <Link href="/answer-keys/upload">
          <Button><PlusIcon className="h-4 w-4 mr-2" />อัปโหลดไฟล์เฉลย</Button>
        </Link>
      </div>
      
      {answerKeys.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <FileTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">ยังไม่มีไฟล์เฉลย</p>
          <Link href="/answer-keys/upload" className="mt-3 inline-block">
            <Button variant="outline" size="sm">อัปโหลดไฟล์เฉลยแรก</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-gray-200 text-left">ชื่อไฟล์</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left">วิชา</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left">เทอม</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left">วันที่อัปโหลด</th>
                <th className="py-2 px-4 border-b border-gray-200 text-left">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {answerKeys.map((answerKey) => (
                <tr key={answerKey.answer_key_id}>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <FileTextIcon className="h-4 w-4 mr-2 text-blue-500" />
                      {answerKey.file_name}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {answerKey.subject.subject_code} - {answerKey.subject.subject_name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">{answerKey.term.term_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(answerKey.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <Link href={`/answer-keys/${answerKey.answer_key_id}/view`}>
                        <Button variant="outline" size="sm">ดู</Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(answerKey.answer_key_id)}
                      >
                        <TrashIcon className="h-4 w-4" />
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