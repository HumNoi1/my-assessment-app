// assessment-backend/src/api/routes/student-answer-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import multer from 'multer';
import { studentAnswerProcessor } from '../../services/processors/student-answer-processor';

const router = Router();

// กำหนดค่า multer สำหรับการรับไฟล์
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // จำกัดขนาดไฟล์ 10MB
  }
});

// Get all student answers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('student_answers')
      .select(`
        *,
        student:students(*),
        answer_key:answer_keys(*),
        folder:folders(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student answers:', error);
    res.status(500).json({ error: 'Failed to fetch student answers' });
  }
});

// Get student answers by student ID
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from('student_answers')
      .select(`
        *,
        student:students(*),
        answer_key:answer_keys(*),
        folder:folders(*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student answers by student:', error);
    res.status(500).json({ error: 'Failed to fetch student answers by student' });
  }
});

// Get student answers by answer key ID
router.get('/answer-key/:answerKeyId', async (req, res) => {
  try {
    const { answerKeyId } = req.params;
    const { data, error } = await supabase
      .from('student_answers')
      .select(`
        *,
        student:students(*),
        answer_key:answer_keys(*),
        folder:folders(*)
      `)
      .eq('answer_key_id', answerKeyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student answers by answer key:', error);
    res.status(500).json({ error: 'Failed to fetch student answers by answer key' });
  }
});

// Get student answers by folder ID
router.get('/folder/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    const { data, error } = await supabase
      .from('student_answers')
      .select(`
        *,
        student:students(*),
        answer_key:answer_keys(*),
        folder:folders(*)
      `)
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student answers by folder:', error);
    res.status(500).json({ error: 'Failed to fetch student answers by folder' });
  }
});

// Get student answer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('student_answers')
      .select(`
        *,
        student:students(*),
        answer_key:answer_keys(*),
        folder:folders(*)
      `)
      .eq('student_answer_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Student answer not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching student answer:', error);
    res.status(500).json({ error: 'Failed to fetch student answer' });
  }
});

// Create new student answer with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { student_id, answer_key_id, folder_id, content } = req.body;
    
    // Validate required fields
    if (!student_id || !answer_key_id || !folder_id || !content) {
      return res.status(400).json({ 
        error: 'Student ID, answer key ID, folder ID, and content are required' 
      });
    }
    
    let file, fileName, contentType;
    
    // ถ้ามีการอัปโหลดไฟล์
    if (req.file) {
      file = req.file.buffer;
      fileName = req.file.originalname;
      contentType = req.file.mimetype;
    } else {
      // ถ้าไม่มีไฟล์ ใช้ชื่อไฟล์จาก body หรือชื่อเริ่มต้น
      fileName = req.body.file_name || `student_answer_${Date.now()}.txt`;
      contentType = 'text/plain';
      file = Buffer.from(content);
    }
    
    // ใช้ processor เพื่ออัปโหลดและประมวลผลคำตอบนักเรียน
    const studentAnswer = await studentAnswerProcessor.uploadAndProcessStudentAnswer(
      file,
      fileName,
      content,
      student_id,
      answer_key_id,
      folder_id,
      contentType
    );
    
    res.status(201).json(studentAnswer);
  } catch (error) {
    console.error('Error creating student answer:', error);
    res.status(500).json({ error: 'Failed to create student answer' });
  }
});

// Update student answer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove immutable fields if present
    delete updateData.student_answer_id;
    delete updateData.created_at;
    delete updateData.file_path;
    delete updateData.milvus_collection_name;
    
    // Check if student answer exists
    const { data: existingStudentAnswer, error: checkError } = await supabase
      .from('student_answers')
      .select('*')
      .eq('student_answer_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingStudentAnswer) {
      return res.status(404).json({ error: 'Student answer not found' });
    }
    
    // Check if content is changed - will need to process embeddings again
    const contentChanged = updateData.content && updateData.content !== existingStudentAnswer.content;
    
    // Update student answer
    const { data, error } = await supabase
      .from('student_answers')
      .update({
        ...updateData,
        processed: contentChanged ? false : existingStudentAnswer.processed,
        updated_at: new Date().toISOString()
      })
      .eq('student_answer_id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If content changed, process embeddings again asynchronously
    if (contentChanged) {
      studentAnswerProcessor.processStudentAnswer(id).catch(err => {
        console.error('Error processing updated student answer:', err);
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating student answer:', error);
    res.status(500).json({ error: 'Failed to update student answer' });
  }
});

// Delete student answer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student answer exists
    const { data: existingStudentAnswer, error: checkError } = await supabase
      .from('student_answers')
      .select('*')
      .eq('student_answer_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingStudentAnswer) {
      return res.status(404).json({ error: 'Student answer not found' });
    }
    
    // Check for references in assessments
    const { data: assessmentsData, error: assessmentsError } = await supabase
      .from('assessments')
      .select('assessment_id')
      .eq('student_answer_id', id)
      .limit(1);
    
    if (assessmentsError) throw assessmentsError;
    
    if (assessmentsData && assessmentsData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete student answer with associated assessments',
        count: assessmentsData.length
      });
    }
    
    // Delete student answer
    const { error: deleteError } = await supabase
      .from('student_answers')
      .delete()
      .eq('student_answer_id', id);
    
    if (deleteError) throw deleteError;
    
    // Cleanup the file in storage if exists
    if (existingStudentAnswer.file_path) {
      try {
        await supabase.storage.from('student_answers').remove([existingStudentAnswer.file_path]);
      } catch (storageError) {
        console.error('Error removing file from storage:', storageError);
        // Continue with response, file cleanup is secondary
      }
    }
    
    // TODO: Cleanup in Milvus collection if needed
    // ตัดส่วนนี้ออกไปเพราะยังไม่มีการทำ cleanup ใน Milvus
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student answer:', error);
    res.status(500).json({ error: 'Failed to delete student answer' });
  }
});

// Process student answer embeddings manually
router.post('/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student answer exists
    const { data: existingStudentAnswer, error: checkError } = await supabase
      .from('student_answers')
      .select('*')
      .eq('student_answer_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingStudentAnswer) {
      return res.status(404).json({ error: 'Student answer not found' });
    }
    
    // Process embeddings
    const success = await studentAnswerProcessor.processStudentAnswer(id);
    
    if (success) {
      res.json({ message: 'Student answer processed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to process student answer' });
    }
  } catch (error) {
    console.error('Error processing student answer:', error);
    res.status(500).json({ error: 'Failed to process student answer' });
  }
});

export default router;