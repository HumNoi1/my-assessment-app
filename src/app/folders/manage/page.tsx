// src/app/folders/manage/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FolderIcon, PlusIcon, FileTextIcon } from 'lucide-react';

interface Folder {
  folder_id: string;
  folder_name: string;
  teacher: { name: string };
  subject: { subject_name: string };
  created_at: string;
}

export default function ManageFoldersPage() {
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
  
  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบโฟลเดอร์นี้ใช่หรือไม่?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setFolders(folders.filter(folder => folder.folder_id !== id));
      } else {
        const error = await response.json();
        alert(`ไม่สามารถลบได้: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จัดการโฟลเดอร์</h1>
        <Link href="/folders/add">
          <Button><PlusIcon className="h-4 w-4 mr-2" />สร้างโฟลเดอร์ใหม่</Button>
        </Link>
      </div>
      
      {folders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <FolderIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">ยังไม่มีโฟลเดอร์</p>
          <Link href="/folders/add" className="mt-3 inline-block">
            <Button variant="outline" size="sm">สร้างโฟลเดอร์แรก</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div key={folder.folder_id} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-blue-50 p-4 flex items-start">
                <FolderIcon className="h-5 w-5 text-blue-500 mr-2 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold">{folder.folder_name}</h3>
                  <p className="text-sm text-gray-600">วิชา: {folder.subject?.subject_name}</p>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">
                  สร้างเมื่อ: {new Date(folder.created_at).toLocaleDateString('th-TH')}
                </p>
                
                <div className="flex space-x-2">
                  <Link href={`/folders/${folder.folder_id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileTextIcon className="h-4 w-4 mr-1" /> จัดการไฟล์
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(folder.folder_id)}
                  >
                    ลบ
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}