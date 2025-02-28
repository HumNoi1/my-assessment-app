// assessment-backend/src/api/controllers/assessment-controller.ts
import { Request, Response } from 'express';
import { enhancedAssessmentService } from '../../services/llm/assessment-service';
import { supabase } from '../../services/supabase/client';

export class AssessmentController {
  /**
   * วิเคราะห์และประเมินคำตอบนักเรียน
   * @param req Request
   * @param res Response
   */
  async analyzeAnswer(req: Request, res: Response) {
    try {
      const { id: studentAnswerId } = req.params;
      const { answerKeyId } = req.body;
      
      // ตรวจสอบว่ามี answerKeyId หรือไม่
      if (!answerKeyId) {
        // ถ้าไม่มี answerKeyId ที่รับมา ให้ลองดึงจากคำตอบนักเรียน
        const { data, error } = await supabase
          .from('student_answers')
          .select('answer_key_id')
          .eq('student_answer_id', studentAnswerId)
          .single();
          
        if (error || !data) {
          return res.status(400).json({ error: 'Answer key ID is required' });
        }
        
        req.body.answerKeyId = data.answer_key_id;
      }
      
      // วิเคราะห์คำตอบนักเรียน
      const assessment = await enhancedAssessmentService.analyzeStudentAnswer(
        studentAnswerId, 
        req.body.answerKeyId
      );
      
      res.json(assessment);
    } catch (error: unknown) {
      console.error('Error analyzing answer:', error);

      if (error instanceof Error) {
        res.status(500).json({ error: error.message || 'Failed to analyze answer' });
      } else {
        res.status(500).json({ error: 'Failed to analyze answer' });
      }
    }
  }
  
  /**
   * เปรียบเทียบคำตอบนักเรียนกับเฉลย
   * @param req Request
   * @param res Response
   */
  async compareAnswers(req: Request, res: Response) {
    try {
      const { id: studentAnswerId } = req.params;
      const { answerKeyId } = req.body;
      
      // ตรวจสอบว่ามี answerKeyId หรือไม่
      if (!answerKeyId) {
        // ถ้าไม่มี answerKeyId ที่รับมา ให้ลองดึงจากคำตอบนักเรียน
        const { data, error } = await supabase
          .from('student_answers')
          .select('answer_key_id')
          .eq('student_answer_id', studentAnswerId)
          .single();
          
        if (error || !data) {
          return res.status(400).json({ error: 'Answer key ID is required' });
        }
        
        req.body.answerKeyId = data.answer_key_id;
      }
      
      // เปรียบเทียบคำตอบ
      const comparison = await enhancedAssessmentService.compareAnswers(
        studentAnswerId, 
        req.body.answerKeyId
      );
      
      res.json(comparison);
    } catch (error: unknown) {
      console.error('Error comparing answers:', error);

      if (error instanceof Error) {
        res.status(500).json({ error: error.message || 'Failed to compare answers' });
      } else {
        res.status(500).json({ error: 'Failed to compare answers' });
      }
    }
  }
  
  /**
   * อนุมัติผลการประเมิน
   * @param req Request
   * @param res Response
   */
  async approveAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { teacherId } = req.body;
      
      if (!teacherId) {
        return res.status(400).json({ error: 'Teacher ID is required' });
      }
      
      // อัปเดตสถานะการอนุมัติ
      const { data, error } = await supabase
        .from('assessments')
        .update({
          is_approved: true,
          approved_by: teacherId,
          updated_at: new Date().toISOString()
        })
        .eq('assessment_id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      res.json(data);
    } catch (error: unknown) {
      console.error('Error approving assessment:', error);

      if (error instanceof Error) {
        res.status(500).json({ error: error.message || 'Failed to approve assessment' });
      } else {
        res.status(500).json({ error: 'Failed to approve assessment' });
      }
    }
  }
  
  /**
   * ดึงข้อมูลการประเมินตาม ID
   * @param req Request
   * @param res Response
   */
  async getAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          student_answer:student_answers(
            *,
            student:students(*)
          ),
          answer_key:answer_keys(*),
          approver:teachers(*)
        `)
        .eq('assessment_id', id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Assessment not found' });
        }
        throw error;
      }
      
      res.json(data);
    } catch (error: unknown) {
      console.error('Error fetching assessment:', error);

      if (error instanceof Error) {
        res.status(500).json({ error: error.message || 'Failed to fetch assessment' });
      } else {
        res.status(500).json({ error: 'Failed to fetch assessment' });
      }
    }
  }
  
  /**
   * ดึงข้อมูลการประเมินทั้งหมด
   * @param req Request
   * @param res Response
   */
  async getAllAssessments(req: Request, res: Response) {
    try {
      // รับพารามิเตอร์เพื่อกรอง
      const { is_approved, teacherId, subjectId, studentId, limit } = req.query;
      
      // สร้าง query object
      let query = supabase
        .from('assessments')
        .select(`
          *,
          student_answer:student_answers(
            *,
            student:students(*),
            folder:folders(*)
          ),
          answer_key:answer_keys(
            *,
            subject:subjects(*)
          ),
          approver:teachers(*)
        `)
        .order('assessment_date', { ascending: false });
      
      // กรองตามสถานะการอนุมัติ
      if (is_approved !== undefined) {
        query = query.eq('is_approved', is_approved === 'true');
      }
      
      // กรองตามครู
      if (teacherId) {
        query = query.eq('approved_by', teacherId);
      }
      
      // กรองตามวิชา (ต้องทำ join จากซ้อน)
      if (subjectId) {
        query = query.filter('answer_key.subject_id', 'eq', subjectId);
      }
      
      // กรองตามนักเรียน (ต้องทำ join ซ้อน)
      if (studentId) {
        query = query.filter('student_answer.student_id', 'eq', studentId);
      }
      
      // จำกัดจำนวนผลลัพธ์
      if (limit) {
        query = query.limit(parseInt(limit as string));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      res.json(data);
    } catch (error: unknown) {
      console.error('Error fetching assessments:', error);

      if (error instanceof Error) {
        res.status(500).json({ error: error.message || 'Failed to fetch assessments' });
      } else {
        res.status(500).json({ error: 'Failed to fetch assessments' });
      }
    }
  }
}

// สร้าง instance เดียวสำหรับใช้งานทั้งระบบ
export const assessmentController = new AssessmentController();