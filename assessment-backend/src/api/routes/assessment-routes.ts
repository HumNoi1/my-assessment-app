// assessment-backend/src/api/routes/assessment-routes.ts
import { Router } from 'express';
import { assessmentController } from '../controllers/assessment-controller';

const router = Router();

// GET /api/assessments - ดึงรายการประเมินทั้งหมด
router.get('/', assessmentController.getAllAssessments);

// GET /api/assessments/:id - ดึงรายละเอียดการประเมิน
router.get('/:id', assessmentController.getAssessment);

// POST /api/assessments/:id/analyze - วิเคราะห์คำตอบนักเรียน
router.post('/:id/analyze', assessmentController.analyzeAnswer);

// POST /api/assessments/:id/compare - เปรียบเทียบคำตอบนักเรียนกับเฉลย
router.post('/:id/compare', assessmentController.compareAnswers);

// PUT /api/assessments/:id/approve - อนุมัติการประเมิน
router.put('/:id/approve', assessmentController.approveAssessment);

export default router;