// assessment-backend/src/api/routes/answer-key-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import multer from 'multer';
import { answerKeyProcessor } from '../../services/processors/amswer-key-processor';

const router = Router();

// กำหนดค่า multer สำหรับการรับไฟล์
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // จำกัดขนาดไฟล์ 10MB
  }
});

// Get all answer keys
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('answer_keys')
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching answer keys:', error);
    res.status(500).json({ error: 'Failed to fetch answer keys' });
  }
});

// Get answer keys by subject ID
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { data, error } = await supabase
      .from('answer_keys')
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching answer keys by subject:', error);
    res.status(500).json({ error: 'Failed to fetch answer keys by subject' });
  }
});

// Get answer keys by term ID
router.get('/term/:termId', async (req, res) => {
  try {
    const { termId } = req.params;
    const { data, error } = await supabase
      .from('answer_keys')
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `)
      .eq('term_id', termId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching answer keys by term:', error);
    res.status(500).json({ error: 'Failed to fetch answer keys by term' });
  }
});

// Get answer key by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('answer_keys')
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `)
      .eq('answer_key_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Answer key not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching answer key:', error);
    res.status(500).json({ error: 'Failed to fetch answer key' });
  }
});

// Create new answer key with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { subject_id, term_id, content } = req.body;
    
    // Validate required fields
    if (!subject_id || !term_id || !content) {
      return res.status(400).json({ 
        error: 'Subject ID, term ID, and content are required' 
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
      fileName = req.body.file_name || `answer_key_${Date.now()}.txt`;
      contentType = 'text/plain';
      file = Buffer.from(content);
    }
    
    // ใช้ processor เพื่ออัปโหลดและประมวลผลไฟล์เฉลย
    const answerKey = await answerKeyProcessor.uploadAndProcessAnswerKey(
      file,
      fileName,
      content,
      subject_id,
      term_id,
      contentType
    );
    
    res.status(201).json(answerKey);
  } catch (error) {
    console.error('Error creating answer key:', error);
    res.status(500).json({ error: 'Failed to create answer key' });
  }
});

// Update answer key
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove immutable fields if present
    delete updateData.answer_key_id;
    delete updateData.created_at;
    delete updateData.file_path;
    delete updateData.milvus_collection_name;
    
    // Check if answer key exists
    const { data: existingAnswerKey, error: checkError } = await supabase
      .from('answer_keys')
      .select('*')
      .eq('answer_key_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingAnswerKey) {
      return res.status(404).json({ error: 'Answer key not found' });
    }
    
    // Check if content is changed - will need to process embeddings again
    const contentChanged = updateData.content && updateData.content !== existingAnswerKey.content;
    
    // Update answer key
    const { data, error } = await supabase
      .from('answer_keys')
      .update({
        ...updateData,
        processed: contentChanged ? false : existingAnswerKey.processed,
        updated_at: new Date().toISOString()
      })
      .eq('answer_key_id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If content changed, process embeddings again asynchronously
    if (contentChanged) {
      answerKeyProcessor.processAnswerKey(id).catch(err => {
        console.error('Error processing updated answer key:', err);
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating answer key:', error);
    res.status(500).json({ error: 'Failed to update answer key' });
  }
});

// Delete answer key
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if answer key exists
    const { data: existingAnswerKey, error: checkError } = await supabase
      .from('answer_keys')
      .select('*')
      .eq('answer_key_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingAnswerKey) {
      return res.status(404).json({ error: 'Answer key not found' });
    }
    
    // Check for references in student_answers
    const { data: studentAnswersData, error: studentAnswersError } = await supabase
      .from('student_answers')
      .select('student_answer_id')
      .eq('answer_key_id', id)
      .limit(1);
    
    if (studentAnswersError) throw studentAnswersError;
    
    if (studentAnswersData && studentAnswersData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete answer key with associated student answers',
        count: studentAnswersData.length
      });
    }
    
    // Delete answer key
    const { error: deleteError } = await supabase
      .from('answer_keys')
      .delete()
      .eq('answer_key_id', id);
    
    if (deleteError) throw deleteError;
    
    // Cleanup the file in storage if exists
    if (existingAnswerKey.file_path) {
      try {
        await supabase.storage.from('answer_keys').remove([existingAnswerKey.file_path]);
      } catch (storageError) {
        console.error('Error removing file from storage:', storageError);
        // Continue with response, file cleanup is secondary
      }
    }
    
    // TODO: Cleanup in Milvus collection if needed
    // ตัดส่วนนี้ออกไปเพราะยังไม่มีการทำ cleanup ใน Milvus
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting answer key:', error);
    res.status(500).json({ error: 'Failed to delete answer key' });
  }
});

// Process answer key embeddings manually
router.post('/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if answer key exists
    const { data: existingAnswerKey, error: checkError } = await supabase
      .from('answer_keys')
      .select('*')
      .eq('answer_key_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingAnswerKey) {
      return res.status(404).json({ error: 'Answer key not found' });
    }
    
    // Process embeddings
    const success = await answerKeyProcessor.processAnswerKey(id);
    
    if (success) {
      res.json({ message: 'Answer key processed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to process answer key' });
    }
  } catch (error) {
    console.error('Error processing answer key:', error);
    res.status(500).json({ error: 'Failed to process answer key' });
  }
});

export default router;