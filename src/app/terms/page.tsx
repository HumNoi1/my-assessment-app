// src/app/terms/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Term {
  term_id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terms`);
        const data = await response.json();
        setTerms(data);
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTerms();
  }, []);
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">เทอมเรียน</h1>
        <Link href="/terms/add">
          <Button>เพิ่มเทอม</Button>
        </Link>
      </div>
      
      {terms.length === 0 ? (
        <p>ไม่พบข้อมูลเทอม</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-gray-200">ชื่อเทอม</th>
                <th className="py-2 px-4 border-b border-gray-200">วันเริ่มต้น</th>
                <th className="py-2 px-4 border-b border-gray-200">วันสิ้นสุด</th>
                <th className="py-2 px-4 border-b border-gray-200">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term) => (
                <tr key={term.term_id}>
                  <td className="py-2 px-4 border-b border-gray-200">{term.term_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(term.start_date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(term.end_date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <Link href={`/terms/${term.term_id}`}>
                        <Button variant="outline" size="sm">แก้ไข</Button>
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