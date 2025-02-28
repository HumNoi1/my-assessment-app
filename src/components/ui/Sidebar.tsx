// src/components/ui/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, FolderOpen, FileText } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-700';
  };

  return (
    <div className="h-screen w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-4 border-b border-indigo-800">
        <h2 className="text-xl font-semibold">ระบบผู้ช่วยตรวจข้อสอบอัตนัย</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/" className={`flex items-center p-2 rounded-md ${isActive('/')}`}>
              <Home className="mr-3" size={20} />
              <span>หน้าหลัก</span>
            </Link>
          </li>
          <li>
            <Link href="/classes" className={`flex items-center p-2 rounded-md ${isActive('/classes')}`}>
              <Users className="mr-3" size={20} />
              <span>ชั้นเรียน</span>
            </Link>
          </li>
          <li>
            <Link href="/subjects" className={`flex items-center p-2 rounded-md ${isActive('/subjects')}`}>
              <BookOpen className="mr-3" size={20} />
              <span>วิชาเรียน</span>
            </Link>
          </li>
          <li>
            <Link href="/folders" className={`flex items-center p-2 rounded-md ${isActive('/folders')}`}>
              <FolderOpen className="mr-3" size={20} />
              <span>โฟลเดอร์งาน</span>
            </Link>
          </li>
          <li>
            <Link href="/answers" className={`flex items-center p-2 rounded-md ${isActive('/answers')}`}>
              <FileText className="mr-3" size={20} />
              <span>คำตอบและเฉลย</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center">
            <span className="font-semibold">อจ</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">อาจารย์ผู้สอน</p>
          </div>
        </div>
      </div>
    </div>
  );
}