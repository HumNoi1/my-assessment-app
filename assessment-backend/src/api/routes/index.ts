// assessment-backend/src/api/routes/index.ts
import { Router } from 'express';
import teacherRoutes from './teacher-routes';
import classRoutes from './class-routes';
import subjectRoutes from './subject-routes';
import termRoutes from './term-routes';
import folderRoutes from './folder-routes';
import answerKeyRoutes from './answer-key-routes';
import studentAnswerRoutes from './student-answer-routes';
import assessmentRoutes from './assessment-routes';
import studentRoutes from './student-routes';

const router = Router();

// ลงทะเบียนเส้นทาง API ทั้งหมด
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/terms', termRoutes);
router.use('/students', studentRoutes);
router.use('/folders', folderRoutes);
router.use('/answer-keys', answerKeyRoutes);
router.use('/student-answers', studentAnswerRoutes);
router.use('/assessments', assessmentRoutes);

export default router;