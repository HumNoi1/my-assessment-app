// assessment-backend/src/api/routes/student-answer-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { uploadFile } from '../../services/supabase/file-service';
import { StudentAnswer, CreateStudentAnswerDto } from '../../types';
import { lmStudioService } from '../../services/llm/lmstudio-service';

const router = Router();

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

// Create new student answer
router.post('/', async (req, res) => {
  try {
    const studentAnswerData: CreateStudentAnswerDto = req.body;
    
    // Validate required fields
    if (!studentAnswerData.file_name || !studentAnswerData.content ||
        !studentAnswerData.student_id || !studentAnswerData.answer_key_id ||
        !studentAnswerData.folder_id) {
      return res.status(400).json({ 
        error: 'File name, content, student ID, answer key ID, and folder ID are required' 
      });
    }
    
    // Check if student exists
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('student_id')
      .eq('student_id', studentAnswerData.student_id)
      .single();
    
    if (studentError || !studentData) {
      return res.status(400).json({ error: 'Student not found' });
    }
    
    // Check if answer key exists
    const { data: answerKeyData, error: answerKeyError } = await supabase
      .from('answer_keys')
      .select('answer_key_id')
      .eq('answer_key_id', studentAnswerData.answer_key_id)
      .single();
    
    if (answerKeyError || !answerKeyData) {
      return res.status(400).json({ error: 'Answer key not found' });
    }
    
    // Check if folder exists
    const { data: folderData, error: folderError } = await supabase
      .from('folders')
      .select('folder_id')
      .eq('folder_id', studentAnswerData.folder_id)
      .single();
    
    if (folderError || !folderData) {
      return res.status(400).json({ error: 'Folder not found' });
    }
    
    // If file data is provided, upload to storage
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const filePath = `student_answers/${studentAnswerData.folder_id}/${Date.now()}_${req.file.originalname}`;
      
      await uploadFile('student_answers', filePath, fileBuffer, req.file.mimetype);
      
      // Set file information
      studentAnswerData.file_path = filePath;
      studentAnswerData.file_size = req.file.size;
      studentAnswerData.file_type = req.file.mimetype;
    }
    
    // Generate collection name for embeddings
    studentAnswerData.milvus_collection_name = `student_answer_${Date.now()}`;
    
    // Insert new student answer
    const { data, error } = await supabase
      .from('student_answers')
      .insert(studentAnswerData)
      .select(`
        *,
        student:students(*),
        answer_key:answer_keys(*),
        folder:folders(*)
      `);
    
    if (error) throw error;
    
    const newStudentAnswer = data[0];
    
    // Trigger async process to generate embeddings
    try {
      const embeddings = await lmStudioService.generateEmbeddings(studentAnswerData.content);
      console.log(`Generated ${embeddings.length} embedding dimensions for student answer ${newStudentAnswer.student_answer_id}`);
      // Store embeddings in Milvus would happen here
    } catch (embeddingError) {
      console.error('Error generating embeddings:', embeddingError);
      // Log error but don't fail the request
    }
    
    res.status(201).json(newStudentAnswer);
  } catch (error) {
    console.error('Error creating student answer:', error);
    res.status(500).json({ error: 'Failed to create student answer' });
  }
});

// Update student answer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const studentAnswerData: Partial<StudentAnswer> = req.body;
    
    // Remove immutable fields if present
    delete studentAnswerData.student_answer_id;
    delete studentAnswerData.created_at;
    
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
    
    // Check relations if changed
    if (studentAnswerData.student_id && studentAnswerData.student_id !== existingStudentAnswer.student_id) {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('student_id')
        .eq('student_id', studentAnswerData.student_id)
        .single();
      
      if (studentError || !studentData) {
        return res.status(400).json({ error: 'Student not found' });
      }
    }
    
    if (studentAnswerData.answer_key_id && studentAnswerData.answer_key_id !== existingStudentAnswer.answer_key_id) {
      const { data: answerKeyData, error: answerKeyError } = await supabase
        .from('answer_keys')
        .select('answer_key_id')
        .eq('answer_key_id', studentAnswerData.answer_key_id)
        .single();
      
      if (answerKeyError || !answerKeyData) {
        return res.status(400).json({ error: 'Answer key not found' });
      }
    }
    
    if (studentAnswerData.folder_id && studentAnswerData.folder_id !== existingStudentAnswer.folder_id) {
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .select('folder_id')
        .eq('folder_id', studentAnswerData.folder_id)
        .single();
      
      if (folderError || !folderData) {
        return res.status(400).json({ error: 'Folder not found' });
      }
    }
    
    // Check if content is changed
    const contentChanged = studentAnswerData.content && studentAnswerData.content !== existingStudentAnswer.content;
    
    // Update student answer
    const { data, error } = await supabase
      .from('student_answers')
      .update(studentAnswerData)
      .eq('student_answer_id', id)
      .select(`
        *,
        student:students(*),
        answer_key:answer_keys(*),
        folder:folders(*)
      `);
    
    if (error) throw error;
    
    const updatedStudentAnswer = data[0];
    
    // If content changed, regenerate embeddings
    if (contentChanged) {
      try {
        const embeddings = await lmStudioService.generateEmbeddings(updatedStudentAnswer.content);
        console.log(`Updated embeddings for student answer ${updatedStudentAnswer.student_answer_id}`);
        // Update embeddings in Milvus would happen here
      } catch (embeddingError) {
        console.error('Error updating embeddings:', embeddingError);
        // Log error but don't fail the request
      }
    }
    
    res.json(updatedStudentAnswer);
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
    
    // Cleanup embeddings in Milvus would happen here
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student answer:', error);
    res.status(500).json({ error: 'Failed to delete student answer' });
  }
});

export default router;