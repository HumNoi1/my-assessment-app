// assessment-backend/src/api/routes/folder-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { Folder, CreateFolderDto } from '../../types';

const router = Router();

// Get all folders
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        teacher:teachers(*),
        subject:subjects(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get folders by teacher ID
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        teacher:teachers(*),
        subject:subjects(*)
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching folders by teacher:', error);
    res.status(500).json({ error: 'Failed to fetch folders by teacher' });
  }
});

// Get folders by subject ID
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        teacher:teachers(*),
        subject:subjects(*)
      `)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching folders by subject:', error);
    res.status(500).json({ error: 'Failed to fetch folders by subject' });
  }
});

// Get folder by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        teacher:teachers(*),
        subject:subjects(*)
      `)
      .eq('folder_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Folder not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
});

// Create new folder
router.post('/', async (req, res) => {
  try {
    const folderData: CreateFolderDto = req.body;
    
    // Validate required fields
    if (!folderData.folder_name || !folderData.teacher_id || !folderData.subject_id) {
      return res.status(400).json({ 
        error: 'Folder name, teacher ID, and subject ID are required' 
      });
    }
    
    // Check if teacher exists
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('teacher_id', folderData.teacher_id)
      .single();
    
    if (teacherError || !teacherData) {
      return res.status(400).json({ error: 'Teacher not found' });
    }
    
    // Check if subject exists
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('subject_id')
      .eq('subject_id', folderData.subject_id)
      .single();
    
    if (subjectError || !subjectData) {
      return res.status(400).json({ error: 'Subject not found' });
    }
    
    // Insert new folder
    const { data, error } = await supabase
      .from('folders')
      .insert(folderData)
      .select(`
        *,
        teacher:teachers(*),
        subject:subjects(*)
      `);
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update folder
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const folderData: Partial<Folder> = req.body;
    
    // Remove immutable fields if present
    delete folderData.folder_id;
    delete folderData.created_at;
    
    // Check if folder exists
    const { data: existingFolder, error: checkError } = await supabase
      .from('folders')
      .select('*')
      .eq('folder_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingFolder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Validate relations if changed
    if (folderData.teacher_id && folderData.teacher_id !== existingFolder.teacher_id) {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('teacher_id')
        .eq('teacher_id', folderData.teacher_id)
        .single();
      
      if (teacherError || !teacherData) {
        return res.status(400).json({ error: 'Teacher not found' });
      }
    }
    
    if (folderData.subject_id && folderData.subject_id !== existingFolder.subject_id) {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('subject_id')
        .eq('subject_id', folderData.subject_id)
        .single();
      
      if (subjectError || !subjectData) {
        return res.status(400).json({ error: 'Subject not found' });
      }
    }
    
    // Update folder
    const { data, error } = await supabase
      .from('folders')
      .update(folderData)
      .eq('folder_id', id)
      .select(`
        *,
        teacher:teachers(*),
        subject:subjects(*)
      `);
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete folder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if folder exists
    const { data: existingFolder, error: checkError } = await supabase
      .from('folders')
      .select('*')
      .eq('folder_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingFolder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Check for references in student_answers
    const { data: studentAnswersData, error: studentAnswersError } = await supabase
      .from('student_answers')
      .select('student_answer_id')
      .eq('folder_id', id)
      .limit(1);
    
    if (studentAnswersError) throw studentAnswersError;
    
    if (studentAnswersData && studentAnswersData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete folder with associated student answers',
        count: studentAnswersData.length
      });
    }
    
    // Delete folder
    const { error: deleteError } = await supabase
      .from('folders')
      .delete()
      .eq('folder_id', id);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;