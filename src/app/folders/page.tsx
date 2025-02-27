// src/app/folders/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Folder {
  folder_id: string;
  folder_name: string;
  teacher: {
    name: string;
  };
  subject: {
    subject_name: string;
  };
  created_at: string;
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders`);
        const data = await response.json();
        setFolders(data);
      } catch (error) {
        console.error('Error fetching folders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFolders();
  }, []);
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">โฟลเดอร์งาน</h1>
        <Link href="/folders/add">
          <Button>สร้างโฟลเดอร์ใหม่</Button>
        </Link>
      </div>
      
      {folders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">ยังไม่มีโฟลเดอร์งาน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Link key={folder.folder_id} href={`/folders/${folder.folder_id}`}>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{folder.folder_name}</h2>
                    <p className="text-sm text-gray-600">วิชา: {folder.subject?.subject_name || 'ไม่ระบุ'}</p>
                    <p className="text-sm text-gray-600">อาจารย์: {folder.teacher?.name || 'ไม่ระบุ'}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(folder.created_at).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}