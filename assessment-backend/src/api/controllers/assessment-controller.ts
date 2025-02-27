// src/api/controllers/assessment-controller.ts
import { Request, Response } from 'express';
import { AssessmentService } from '../../services/llm/assessment-service';

export class AssessmentController {
  private assessmentService: AssessmentService;
  
  constructor(assessmentService: AssessmentService) {
    this.assessmentService = assessmentService;
  }
  
  async analyzeAnswer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assessment = await this.assessmentService.analyzeStudentAnswer(
        id, 
        req.body.answerKeyId
      );
      
      res.json(assessment);
    } catch (error) {
      console.error('Error analyzing answer:', error);
      res.status(500).json({ error: 'Failed to analyze answer' });
    }
  }
}