// assessment-backend/src/api/routes/assessment-routes.ts
import { Router, Request, Response } from 'express';
import { assessmentController } from '../controllers/assessment-controller';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => assessmentController.getAllAssessments(req, res));
router.get('/:id', (req: Request, res: Response) => assessmentController.getAssessment(req, res));
router.post('/:id/analyze', (req: Request, res: Response) => assessmentController.analyzeAnswer(req, res));
router.post('/:id/compare', (req: Request, res: Response) => assessmentController.compareAnswers(req, res));
router.put('/:id/approve', (req: Request, res: Response) => assessmentController.approveAssessment(req, res));

export default router;