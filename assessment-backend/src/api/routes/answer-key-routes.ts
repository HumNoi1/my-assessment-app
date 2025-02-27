// assessment-backend/src/api/routes/answer-key-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { uploadFile } from '../../services/supabase/file-service';
import { AnswerKey, CreateAnswerKeyDto } from '../../types';
import { lmStudioService } from '../../services/llm/lmstudio-service';

const router = Router();

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

// Create new answer key
router.post('/', async (req, res) => {
  try {
    const answerKeyData: CreateAnswerKeyDto = req.body;
    
    // Validate required fields
    if (!answerKeyData.file_name || !answerKeyData.content || 
        !answerKeyData.subject_id || !answerKeyData.term_id) {
      return res.status(400).json({ 
        error: 'File name, content, subject ID, and term ID are required' 
      });
    }
    
    // Check if subject exists
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('subject_id')
      .eq('subject_id', answerKeyData.subject_id)
      .single();
    
    if (subjectError || !subjectData) {
      return res.status(400).json({ error: 'Subject not found' });
    }
    
    // Check if term exists
    const { data: termData, error: termError } = await supabase
      .from('terms')
      .select('term_id')
      .eq('term_id', answerKeyData.term_id)
      .single();
    
    if (termError || !termData) {
      return res.status(400).json({ error: 'Term not found' });
    }
    
    // If file data is provided, upload to storage
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const filePath = `answer_keys/${answerKeyData.subject_id}/${Date.now()}_${req.file.originalname}`;
      
      await uploadFile('answer_keys', filePath, fileBuffer, req.file.mimetype);
      
      // Set file information
      answerKeyData.file_path = filePath;
      answerKeyData.file_size = req.file.size;
      answerKeyData.file_type = req.file.mimetype;
    }
    
    // Generate collection name for embeddings
    answerKeyData.milvus_collection_name = `answer_key_${Date.now()}`;
    
    // Insert new answer key
    const { data, error } = await supabase
      .from('answer_keys')
      .insert(answerKeyData)
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `);
    
    if (error) throw error;
    
    const newAnswerKey = data[0];
    
    // Trigger async process to generate embeddings
    // This would typically be done in a background job
    // For simplicity, we're starting it here but not awaiting completion
    try {
      const embeddings = await lmStudioService.generateEmbeddings(answerKeyData.content);
      console.log(`Generated ${embeddings.length} embedding dimensions for answer key ${newAnswerKey.answer_key_id}`);
      // Store embeddings in Milvus would happen here
    } catch (embeddingError) {
      console.error('Error generating embeddings:', embeddingError);
      // Log error but don't fail the request
    }
    
    res.status(201).json(newAnswerKey);
  } catch (error) {
    console.error('Error creating answer key:', error);
    res.status(500).json({ error: 'Failed to create answer key' });
  }
});

// Update answer key
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const answerKeyData: Partial<AnswerKey> = req.body;
    
    // Remove immutable fields if present
    delete answerKeyData.answer_key_id;
    delete answerKeyData.created_at;
    
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
    
    // Check relations if changed
    if (answerKeyData.subject_id && answerKeyData.subject_id !== existingAnswerKey.subject_id) {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('subject_id')
        .eq('subject_id', answerKeyData.subject_id)
        .single();
      
      if (subjectError || !subjectData) {
        return res.status(400).json({ error: 'Subject not found' });
      }
    }
    
    if (answerKeyData.term_id && answerKeyData.term_id !== existingAnswerKey.term_id) {
      const { data: termData, error: termError } = await supabase
        .from('terms')
        .select('term_id')
        .eq('term_id', answerKeyData.term_id)
        .single();
      
      if (termError || !termData) {
        return res.status(400).json({ error: 'Term not found' });
      }
    }
    
    // If content is changed, we would need to regenerate embeddings
    const contentChanged = answerKeyData.content && answerKeyData.content !== existingAnswerKey.content;
    
    // Update answer key
    const { data, error } = await supabase
      .from('answer_keys')
      .update(answerKeyData)
      .eq('answer_key_id', id)
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `);
    
    if (error) throw error;
    
    const updatedAnswerKey = data[0];
    
    // If content changed, regenerate embeddings
    if (contentChanged) {
      try {
        const embeddings = await lmStudioService.generateEmbeddings(updatedAnswerKey.content);
        console.log(`Updated embeddings for answer key ${updatedAnswerKey.answer_key_id}`);
        // Update embeddings in Milvus would happen here
      } catch (embeddingError) {
        console.error('Error updating embeddings:', embeddingError);
        // Log error but don't fail the request
      }
    }
    
    res.json(updatedAnswerKey);
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
    
    // Cleanup embeddings in Milvus would happen here
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting answer key:', error);
    res.status(500).json({ error: 'Failed to delete answer key' });
  }
});

export default router;