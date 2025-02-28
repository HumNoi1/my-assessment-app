// src/app/answers/check/[id]/page.tsx
'use client'

import { notFound } from "next/navigation";
import Layout from "@/components/ui/Layout";
import Link from 'next/link';
import { ArrowLeft, Send, Save, AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';

export default function CheckAnswerPage({ params }: { params: { id: string } }) {
  const answerId = parseInt(params.id);
  
  // ถ้า ID ไม่ถูกต้องหรือไม่พบข้อมูล
  if (isNaN(answerId) || answerId < 0 || answerId >= answers.length) {
    notFound();
  }
  
  const answer = answers[answerId];
  
  // State สำหรับคะแนนและความคิดเห็น
  const [score, setScore] = useState(answer.score || 0);
  const [feedback, setFeedback] = useState('');
  const [confidence, setConfidence] = useState(90); // ความมั่นใจของ LLM (สมมติ)
  const [isChecking, setIsChecking] = useState(false);
  
  // ฟังก์ชันจำลองการตรวจด้วย LLM
  const handleCheckWithLLM = () => {
    setIsChecking(true);
    
    // จำลองการทำงานของ LLM (delay 2 วินาที)
    setTimeout(() => {
      setScore(85);
      setFeedback('คำตอบมีความถูกต้องเป็นส่วนใหญ่ สามารถอธิบายความหมายและหลักการได้ดี แต่ยังขาดการยกตัวอย่างที่ชัดเจน และมีข้อผิดพลาดเล็กน้อยในเรื่องการเรียงลำดับความสำคัญ ควรปรับปรุงการเชื่อมโยงเนื้อหาให้มีความต่อเนื่องมากขึ้น');
      setConfidence(87);
      setIsChecking(false);
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/answers" className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4">
            <ArrowLeft size={20} className="mr-1" />
            <span>กลับไปยังรายการ</span>
          </Link>
          <h1 className="text-2xl font-bold">ตรวจคำตอบ</h1>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${answer.status === 'ตรวจแล้ว' ? 'bg-green-100 text-green-800' : 
                answer.status === 'รอการตรวจ' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}
            >
              {answer.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ข้อมูลนักเรียนและงาน */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ข้อมูลนักเรียน</h3>
                  <p className="mt-1 text-base font-medium">{answer.student}</p>
                  <p className="text-sm text-gray-600">รหัส: {answer.studentId}</p>
                  <p className="text-sm text-gray-600">ชั้น: {answer.class}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">รายละเอียดงาน</h3>
                  <p className="mt-1 text-base font-medium">{answer.subject}</p>
                  <p className="text-sm text-gray-600">โฟลเดอร์: {answer.folder}</p>
                  <p className="text-sm text-gray-600">วันที่ส่ง: {answer.submittedDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">คะแนน</h3>
                  <div className="flex items-center mt-1">
                    <p className="text-3xl font-bold mr-1">{score}</p>
                    <p className="text-lg">/100</p>
                  </div>
                  <p className="text-sm text-gray-600">ความมั่นใจในการตรวจ: {confidence}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* คำตอบของนักเรียน */}
          <div className="lg:col-span-3 xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md h-full">
              <div className="p-4 border-b flex justify-between items-center bg-blue-50">
                <h2 className="font-semibold text-blue-800">คำตอบของนักเรียน</h2>
                <div className="relative">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Search size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-auto h-[500px]">
                <div className="prose prose-sm max-w-none">
                  <p>การเขียนเรียงความเรื่อง &ldquo;วัฒนธรรมไทยกับการอนุรักษ์&rdquo; มีจุดมุ่งหมายเพื่อให้ผู้อ่านตระหนักถึงความสำคัญของวัฒนธรรมไทยและการอนุรักษ์ไว้ให้คงอยู่สืบไป</p>
                  <p>วัฒนธรรมไทยเป็นเอกลักษณ์ที่แสดงถึงความเป็นชาติที่มีประวัติศาสตร์อันยาวนาน ไม่ว่าจะเป็นภาษา ศิลปะ การแต่งกาย อาหาร ประเพณี หรือวิถีชีวิตความเป็นอยู่ล้วนมีความสำคัญต่อการดำรงอยู่ของความเป็นไทย</p>
                  <p>ปัจจุบันกระแสโลกาภิวัตน์และวัฒนธรรมตะวันตกได้เข้ามามีอิทธิพลต่อสังคมไทยอย่างมาก ทำให้วัฒนธรรมดั้งเดิมของไทยเริ่มจางหายไปจากสังคม เยาวชนรุ่นใหม่หลายคนละเลยและไม่เห็นความสำคัญของวัฒนธรรมไทย</p>
                  <p>การอนุรักษ์วัฒนธรรมไทยจึงมีความสำคัญอย่างยิ่ง เริ่มต้นจากการปลูกฝังให้เยาวชนตระหนักถึงคุณค่าของวัฒนธรรมไทย ผ่านการเรียนรู้ทั้งในและนอกระบบการศึกษา การสนับสนุนให้มีกิจกรรมต่างๆ ที่เกี่ยวกับวัฒนธรรมไทย</p>
                  <p>นอกจากนี้ หน่วยงานภาครัฐควรมีนโยบายที่ชัดเจนในการอนุรักษ์และส่งเสริมวัฒนธรรมไทย สร้างความร่วมมือระหว่างภาคส่วนต่างๆ ในการดำเนินกิจกรรมที่เกี่ยวข้อง</p>
                  <p>ตัวอย่างการอนุรักษ์วัฒนธรรมไทยที่สามารถทำได้ในชีวิตประจำวัน ได้แก่ การใช้ภาษาไทยที่ถูกต้อง การแต่งกายด้วยชุดไทยในโอกาสที่เหมาะสม การรักษามารยาทและขนบธรรมเนียมประเพณีไทย</p>
                  <p>หากทุกคนร่วมมือกันอนุรักษ์และสืบสานวัฒนธรรมไทย เราจะสามารถรักษาเอกลักษณ์และคุณค่าของความเป็นไทยไว้ได้อย่างยั่งยืน และเป็นการส่งต่อมรดกทางวัฒนธรรมให้กับคนรุ่นต่อไป</p>
                </div>
              </div>
            </div>
          </div>

          {/* เฉลย */}
          <div className="lg:col-span-3 xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md h-full">
              <div className="p-4 border-b flex justify-between items-center bg-green-50">
                <h2 className="font-semibold text-green-800">เฉลย / แนวคำตอบ</h2>
                <div className="relative">
                  <button className="text-green-600 hover:text-green-800">
                    <Search size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-auto h-[500px]">
                <div className="prose prose-sm max-w-none">
                  <p>แนวคำตอบเรียงความเรื่อง &ldquo;วัฒนธรรมไทยกับการอนุรักษ์&rdquo; ควรประกอบด้วยประเด็นต่อไปนี้</p>
                  <h3>1. ความสำคัญของวัฒนธรรมไทย</h3>
                  <ul>
                    <li>ความหมายและประเภทของวัฒนธรรมไทย (วัฒนธรรมที่เป็นวัตถุและไม่ใช่วัตถุ)</li>
                    <li>คุณค่าและความสำคัญของวัฒนธรรมไทยต่อความเป็นชาติ</li>
                    <li>เอกลักษณ์ของวัฒนธรรมไทยที่แตกต่างจากชาติอื่น</li>
                    <li>ยกตัวอย่างวัฒนธรรมที่โดดเด่นของไทย เช่น ภาษา ศิลปะ ประเพณี อาหาร การแต่งกาย มารยาท ฯลฯ</li>
                  </ul>
                  <h3>2. สถานการณ์ปัจจุบันของวัฒนธรรมไทย</h3>
                  <ul>
                    <li>ปัญหาและความท้าทายของวัฒนธรรมไทยในปัจจุบัน</li>
                    <li>ผลกระทบจากกระแสโลกาภิวัตน์และวัฒนธรรมต่างชาติ</li>
                    <li>ทัศนคติและพฤติกรรมของคนรุ่นใหม่ต่อวัฒนธรรมไทย</li>
                    <li>ผลเสียที่อาจเกิดขึ้นหากละเลยวัฒนธรรมไทย</li>
                  </ul>
                  <h3>3. แนวทางการอนุรักษ์วัฒนธรรมไทย</h3>
                  <ul>
                    <li>บทบาทของภาครัฐในการส่งเสริมและอนุรักษ์วัฒนธรรมไทย</li>
                    <li>บทบาทของสถาบันการศึกษาในการปลูกฝังความรู้และความตระหนัก</li>
                    <li>บทบาทของครอบครัวในการถ่ายทอดวัฒนธรรมสู่เยาวชน</li>
                    <li>บทบาทของสื่อมวลชนในการสื่อสารและส่งเสริมวัฒนธรรมไทย</li>
                    <li>แนวทางการปรับตัวของวัฒนธรรมไทยให้เข้ากับยุคสมัยโดยยังคงรักษาแก่นสำคัญ</li>
                  </ul>
                  <h3>4. ตัวอย่างความสำเร็จในการอนุรักษ์วัฒนธรรมไทย</h3>
                  <ul>
                    <li>กรณีศึกษาหรือตัวอย่างที่ประสบความสำเร็จในการอนุรักษ์วัฒนธรรมไทย</li>
                    <li>บุคคลหรือองค์กรที่มีบทบาทสำคัญในการอนุรักษ์วัฒนธรรมไทย</li>
                  </ul>
                  <h3>5. บทสรุปและข้อเสนอแนะ</h3>
                  <ul>
                    <li>สรุปความสำคัญของการอนุรักษ์วัฒนธรรมไทย</li>
                    <li>เสนอแนะแนวทางการมีส่วนร่วมของทุกภาคส่วนในการอนุรักษ์วัฒนธรรมไทย</li>
                    <li>การวางวิสัยทัศน์ของวัฒนธรรมไทยในอนาคต</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนการประเมิน */}
          <div className="lg:col-span-3 xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md h-full">
              <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
                <h2 className="font-semibold text-indigo-800">การประเมินและข้อเสนอแนะ</h2>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คะแนน (0-100)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
                    />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          score >= 80 ? 'bg-green-500' :
                          score >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ข้อเสนอแนะ
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="เขียนข้อเสนอแนะให้กับนักเรียน..."
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ความมั่นใจในการตรวจ
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      value={confidence}
                      onChange={(e) => setConfidence(parseInt(e.target.value))}
                      min="0"
                      max="100"
                      step="1"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 text-sm font-medium">{confidence}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    onClick={handleCheckWithLLM}
                    disabled={isChecking}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        กำลังตรวจ...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        ตรวจด้วย LLM
                      </>
                    )}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <AlertTriangle size={18} className="mr-2 text-amber-500" />
                      แจ้งปัญหา
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      <Save size={18} className="mr-2" />
                      บันทึก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ข้อมูลตัวอย่างสำหรับคำตอบ (เหมือนกับใน answers/page.tsx)
const answers = [
  { student: 'นายสมชาย ใจดี', studentId: '10001', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'ตรวจแล้ว', score: 85 },
  { student: 'นางสาวสมหญิง รักเรียน', studentId: '10002', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'ตรวจแล้ว', score: 92 },
  { student: 'นายวิชัย เรียนดี', studentId: '10003', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'รอการตรวจ', score: null },
  { student: 'นางสาวมนัสนันท์ สุขใจ', studentId: '10004', class: 'ม.1/1', subject: 'ภาษาไทย', folder: 'แบบฝึกหัดกลางภาค', submittedDate: '25 ก.พ. 2567', status: 'รอการตรวจ', score: null },
  { student: 'นายภูมิ ภูมิใจ', studentId: '10005', class: 'ม.1/2', subject: 'คณิตศาสตร์', folder: 'โจทย์คณิตศาสตร์', submittedDate: '24 ก.พ. 2567', status: 'มีปัญหา', score: null },
  { student: 'นางสาวแก้ว ใสสะอาด', studentId: '10006', class: 'ม.1/2', subject: 'คณิตศาสตร์', folder: 'โจทย์คณิตศาสตร์', submittedDate: '24 ก.พ. 2567', status: 'ตรวจแล้ว', score: 78 },
  { student: 'นายณัฐ ฉลาด', studentId: '10007', class: 'ม.2/1', subject: 'วิทยาศาสตร์', folder: 'รายงานการทดลอง', submittedDate: '23 ก.พ. 2567', status: 'ตรวจแล้ว', score: 95 },
  { student: 'นางสาวพิมพ์ สวยงาม', studentId: '10008', class: 'ม.2/1', subject: 'วิทยาศาสตร์', folder: 'รายงานการทดลอง', submittedDate: '23 ก.พ. 2567', status: 'รอการตรวจ', score: null },
  { student: 'นายนิติ ถูกต้อง', studentId: '10009', class: 'ม.3/1', subject: 'สังคมศึกษา', folder: 'แบบทดสอบปลายภาค', submittedDate: '22 ก.พ. 2567', status: 'ตรวจแล้ว', score: 88 },
  { student: 'นางสาวกนกพร พรพรรณ', studentId: '10010', class: 'ม.3/2', subject: 'ภาษาอังกฤษ', folder: 'งานเขียนเรียงความ', submittedDate: '21 ก.พ. 2567', status: 'รอการตรวจ', score: null },
];