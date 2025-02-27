// assessment-backend/src/api/routes/subject-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { Subject, CreateSubjectDto, CreateSubjectTermDto } from '../../types';

const router = Router();

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        teacher:teachers(*),
        class:classes(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get subjects by teacher ID
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        teacher:teachers(*),
        class:classes(*)
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching subjects by teacher:', error);
    res.status(500).json({ error: 'Failed to fetch subjects by teacher' });
  }
});

// Get subjects by class ID
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        teacher:teachers(*),
        class:classes(*)
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching subjects by class:', error);
    res.status(500).json({ error: 'Failed to fetch subjects by class' });
  }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        teacher:teachers(*),
        class:classes(*)
      `)
      .eq('subject_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subject not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// Get terms for a subject
router.get('/:id/terms', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('subject_term')
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `)
      .eq('subject_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching subject terms:', error);
    res.status(500).json({ error: 'Failed to fetch subject terms' });
  }
});

// Create new subject
router.post('/', async (req, res) => {
  try {
    const subjectData: CreateSubjectDto = req.body;
    
    // Validate required fields
    if (!subjectData.subject_name || !subjectData.subject_code || 
        !subjectData.teacher_id || !subjectData.class_id) {
      return res.status(400).json({ 
        error: 'Subject name, subject code, teacher ID, and class ID are required' 
      });
    }
    
    // Check if teacher exists
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('teacher_id', subjectData.teacher_id)
      .single();
    
    if (teacherError || !teacherData) {
      return res.status(400).json({ error: 'Teacher not found' });
    }
    
    // Check if class exists
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('class_id')
      .eq('class_id', subjectData.class_id)
      .single();
    
    if (classError || !classData) {
      return res.status(400).json({ error: 'Class not found' });
    }
    
    // Insert new subject
    const { data, error } = await supabase
      .from('subjects')
      .insert(subjectData)
      .select(`
        *,
        teacher:teachers(*),
        class:classes(*)
      `);
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Add term to a subject
router.post('/:id/terms', async (req, res) => {
  try {
    const { id } = req.params;
    const subjectTermData: CreateSubjectTermDto = req.body;
    
    // Validate required fields
    if (!subjectTermData.term_id) {
      return res.status(400).json({ error: 'Term ID is required' });
    }
    
    // Override subject_id with the path parameter
    subjectTermData.subject_id = id;
    
    // Check if subject exists
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('subject_id')
      .eq('subject_id', id)
      .single();
    
    if (subjectError || !subjectData) {
      return res.status(400).json({ error: 'Subject not found' });
    }
    
    // Check if term exists
    const { data: termData, error: termError } = await supabase
      .from('terms')
      .select('term_id')
      .eq('term_id', subjectTermData.term_id)
      .single();
    
    if (termError || !termData) {
      return res.status(400).json({ error: 'Term not found' });
    }
    
    // Check if association already exists
    const { data: existingData, error: existingError } = await supabase
      .from('subject_term')
      .select('*')
      .eq('subject_id', id)
      .eq('term_id', subjectTermData.term_id)
      .maybeSingle();
    
    if (existingError) throw existingError;
    
    if (existingData) {
      return res.status(409).json({ error: 'Subject is already associated with this term' });
    }
    
    // Insert subject-term association
    const { data, error } = await supabase
      .from('subject_term')
      .insert(subjectTermData)
      .select(`
        *,
        subject:subjects(*),
        term:terms(*)
      `);
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding term to subject:', error);
    res.status(500).json({ error: 'Failed to add term to subject' });
  }
});

// Update subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subjectData: Partial<Subject> = req.body;
    
    // Remove immutable fields if present
    delete subjectData.subject_id;
    delete subjectData.created_at;
    
    // Check if subject exists
    const { data: existingSubject, error: checkError } = await supabase
      .from('subjects')
      .select('*')
      .eq('subject_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Check if teacher exists if teacher_id is being updated
    if (subjectData.teacher_id && subjectData.teacher_id !== existingSubject.teacher_id) {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('teacher_id')
        .eq('teacher_id', subjectData.teacher_id)
        .single();
      
      if (teacherError || !teacherData) {
        return res.status(400).json({ error: 'Teacher not found' });
      }
    }
    
    // Check if class exists if class_id is being updated
    if (subjectData.class_id && subjectData.class_id !== existingSubject.class_id) {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('class_id')
        .eq('class_id', subjectData.class_id)
        .single();
      
      if (classError || !classData) {
        return res.status(400).json({ error: 'Class not found' });
      }
    }
    
    // Update subject
    const { data, error } = await supabase
      .from('subjects')
      .update(subjectData)
      .eq('subject_id', id)
      .select(`
        *,
        teacher:teachers(*),
        class:classes(*)
      `);
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Remove term from a subject
router.delete('/:subjectId/terms/:termId', async (req, res) => {
  try {
    const { subjectId, termId } = req.params;
    
    // Check if association exists
    const { data: existingData, error: existingError } = await supabase
      .from('subject_term')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('term_id', termId)
      .maybeSingle();
    
    if (existingError) throw existingError;
    
    if (!existingData) {
      return res.status(404).json({ error: 'Subject-term association not found' });
    }
    
    // Check for references in answer_keys
    const { data: answerKeysData, error: answerKeysError } = await supabase
      .from('answer_keys')
      .select('answer_key_id')
      .eq('subject_id', subjectId)
      .eq('term_id', termId)
      .limit(1);
    
    if (answerKeysError) throw answerKeysError;
    
    if (answerKeysData && answerKeysData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot remove association with answer keys that reference it',
        count: answerKeysData.length
      });
    }
    
    // Delete subject-term association
    const { error: deleteError } = await supabase
      .from('subject_term')
      .delete()
      .eq('subject_id', subjectId)
      .eq('term_id', termId);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error removing term from subject:', error);
    res.status(500).json({ error: 'Failed to remove term from subject' });
  }
});

// Delete subject
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subject exists
    const { data: existingSubject, error: checkError } = await supabase
      .from('subjects')
      .select('*')
      .eq('subject_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Check for references in other tables (answer_keys, folders)
    const { data: answerKeysData, error: answerKeysError } = await supabase
      .from('answer_keys')
      .select('answer_key_id')
      .eq('subject_id', id)
      .limit(1);
    
    if (answerKeysError) throw answerKeysError;
    
    if (answerKeysData && answerKeysData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete subject with associated answer keys',
        count: answerKeysData.length
      });
    }
    
    const { data: foldersData, error: foldersError } = await supabase
      .from('folders')
      .select('folder_id')
      .eq('subject_id', id)
      .limit(1);
    
    if (foldersError) throw foldersError;
    
    if (foldersData && foldersData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete subject with associated folders',
        count: foldersData.length
      });
    }
    
    // Delete all subject-term associations
    const { error: deleteAssociationsError } = await supabase
      .from('subject_term')
      .delete()
      .eq('subject_id', id);
    
    if (deleteAssociationsError) throw deleteAssociationsError;
    
    // Delete subject
    const { error: deleteError } = await supabase
      .from('subjects')
      .delete()
      .eq('subject_id', id);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;