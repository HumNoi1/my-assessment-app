// src/app/teachers/add/page.tsx
import TeacherForm from '@/components/forms/TeacherForm';

export default function AddTeacherPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">เพิ่มอาจารย์</h1>
      <TeacherForm />
    </div>
  );
}