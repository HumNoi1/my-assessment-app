// app/assessment/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface Assessment {
  id: string;
  studentAnswer: { content: string };
  answerKey: { content: string };
  score: number | null;
  feedback: string | null;
  confidence: number | null;
  isApproved: boolean;
}

export default function AssessmentPage() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssessing, setIsAssessing] = useState(false);
  
  useEffect(() => {
    // Fetch assessment data from API
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${id}`);
        const data = await response.json();
        setAssessment(data);
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssessment();
  }, [id]);
  
  const handleAssess = async () => {
    setIsAssessing(true);
    try {
      const response = await fetch(`/api/assessments/${id}/analyze`, {
        method: 'POST'
      });
      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      console.error('Error assessing answer:', error);
    } finally {
      setIsAssessing(false);
    }
  };
  
  const handleApprove = async () => {
    // Code to approve assessment
  };
  
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (!assessment) return <div>ไม่พบข้อมูลการประเมิน</div>;
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">ตรวจข้อสอบ</h1>
      
      <Tabs defaultValue="compare">
        <TabsList>
          <TabsTrigger value="compare">เปรียบเทียบคำตอบ</TabsTrigger>
          <TabsTrigger value="student">คำตอบนักเรียน</TabsTrigger>
          <TabsTrigger value="key">เฉลย</TabsTrigger>
          <TabsTrigger value="result">ผลการประเมิน</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compare" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">คำตอบนักเรียน</h3>
              <div className="whitespace-pre-wrap">{assessment.studentAnswer.content}</div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">เฉลย</h3>
              <div className="whitespace-pre-wrap">{assessment.answerKey.content}</div>
            </div>
          </div>
        </TabsContent>
        
        {/* Other tab contents would go here */}
        
        <div className="mt-6 flex gap-4">
          <Button 
            onClick={handleAssess} 
            disabled={isAssessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAssessing ? 'กำลังประมวลผล...' : 'ประเมินคำตอบ'}
          </Button>
          
          {assessment.score !== null && (
            <Button 
              onClick={handleApprove}
              disabled={assessment.isApproved}
              className="bg-green-600 hover:bg-green-700"
            >
              {assessment.isApproved ? 'อนุมัติแล้ว' : 'อนุมัติคะแนน'}
            </Button>
          )}
        </div>
      </Tabs>
      
      {assessment.score !== null && (
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold text-xl mb-2">ผลการประเมิน</h2>
          <p className="text-lg">คะแนน: <span className="font-bold">{assessment.score}</span></p>
          <p className="text-sm text-gray-500">ความมั่นใจในการประเมิน: {assessment.confidence}%</p>
          <h3 className="font-semibold mt-4 mb-2">ข้อเสนอแนะ:</h3>
          <div className="whitespace-pre-wrap">{assessment.feedback}</div>
        </div>
      )}
    </div>
  );
}