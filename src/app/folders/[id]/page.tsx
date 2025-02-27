// src/app/folders/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';

interface Folder {
  folder_id: string;
  folder_name: string;
  teacher: {
    name: string;
  };
  subject: {
    subject_name: string;
  };
}

interface AnswerKey {
  answer_key_id: string;
  file_name: string;
  created_at: string;
}

interface Student {
  student_id: string;
  name: string;
}

interface StudentAnswer {
  student_answer_id: string;
  file_name: string;
  student: {
    name: string;
  };
  created_at: string;
}

export default function FolderDetailPage({ params }: { params: { id: string } }) {
  const [folder, setFolder] = useState<Folder | null>(null);
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedAnswerKey, setSelectedAnswerKey] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('student-answers');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch folder details
        const folderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders/${params.id}`);
        const folderData = await folderResponse.json();
        setFolder(folderData);
        
        // Fetch answer keys for this subject
        const answerKeysResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer-keys/subject/${folderData.subject_id}`);
        const answerKeysData = await answerKeysResponse.json();
        setAnswerKeys(answerKeysData);
        
        // Fetch student answers in this folder
        const studentAnswersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-answers/folder/${params.id}`);
        const studentAnswersData = await studentAnswersResponse.json();
        setStudentAnswers(studentAnswersData);
        
        // Fetch students for this class
        const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/class/${folderData.subject.class_id}`);
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  const handleFileUpload = async (file: File) => {
    if (!selectedAnswerKey || !selectedStudent) {
      alert('กรุณาเลือกไฟล์เฉลยและนักเรียน');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', file.name);
    formData.append('student_id', selectedStudent);
    formData.append('answer_key_id', selectedAnswerKey);
    formData.append('folder_id', params.id);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-answers`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Refresh student answers list
        const studentAnswersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-answers/folder/${params.id}`);
        const studentAnswersData = await studentAnswersResponse.json();
        setStudentAnswers(studentAnswersData);
        
        // Reset selections
        setSelectedAnswerKey('');
        setSelectedStudent('');
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!folder) return <div>ไม่พบข้อมูลโฟลเดอร์</div>;
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/folders">
          <Button variant="outline" size="sm">← กลับไปหน้าโฟลเดอร์</Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{folder.folder_name}</h1>
          <p className="text-gray-600">วิชา: {folder.subject?.subject_name}</p>
          <p className="text-gray-600">อาจารย์: {folder.teacher?.name}</p>
        </div>
        <div>
          <Button onClick={() => setActiveTab('upload')} variant={activeTab === 'upload' ? 'default' : 'outline'} className="mr-2">
            อัปโหลดไฟล์
          </Button>
          <Button onClick={() => setActiveTab('student-answers')} variant={activeTab === 'student-answers' ? 'default' : 'outline'}>
            รายการไฟล์
          </Button>
        </div>
      </div>
      
      {activeTab === 'upload' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">อัปโหลดไฟล์งานนักเรียน</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลือกไฟล์เฉลย
              </label>
              <select
                value={selectedAnswerKey}
                onChange={(e) => setSelectedAnswerKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">เลือกไฟล์เฉลย</option>
                {answerKeys.map(key => (
                  <option key={key.answer_key_id} value={key.answer_key_id}>
                    {key.file_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลือกนักเรียน
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
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
          </div>
          
          <FileUpload
            onFileAccepted={handleFileUpload}
            acceptedFileTypes=".txt,.pdf,.doc,.docx"
            label="ไฟล์คำตอบของนักเรียน"
          />
        </div>
      )}
      
      {activeTab === 'student-answers' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">รายการไฟล์คำตอบนักเรียน</h2>
          
          {studentAnswers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">ยังไม่มีไฟล์คำตอบนักเรียนในโฟลเดอร์นี้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b border-gray-200 text-left">ชื่อไฟล์</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left">นักเรียน</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left">วันที่อัปโหลด</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left">การประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAnswers.map((answer) => (
                    <tr key={answer.student_answer_id}>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <Link href={`/assessment/${answer.student_answer_id}`} className="text-blue-600 hover:underline">
                          {answer.file_name}
                        </Link>
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">{answer.student?.name}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {new Date(answer.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <Link href={`/assessment/${answer.student_answer_id}`}>
                          <Button size="sm">ตรวจข้อสอบ</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}