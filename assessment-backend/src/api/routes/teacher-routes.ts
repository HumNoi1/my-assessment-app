// assessment-backend/src/api/routes/teacher-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { Teacher, CreateTeacherDto } from '../../types';

const router = Router();

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('teacher_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Create new teacher
router.post('/', async (req, res) => {
  try {
    const teacherData: CreateTeacherDto = req.body;
    
    // Validate required fields
    if (!teacherData.name || !teacherData.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email already exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('email')
      .eq('email', teacherData.email)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingTeacher) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Insert new teacher
    const { data, error } = await supabase
      .from('teachers')
      .insert(teacherData)
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

// Update teacher
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teacherData: Partial<Teacher> = req.body;
    
    // Remove immutable fields if present
    delete teacherData.teacher_id;
    delete teacherData.created_at;
    
    // Check if teacher exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('*')
      .eq('teacher_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    // Check if email already exists for another teacher
    if (teacherData.email && teacherData.email !== existingTeacher.email) {
      const { data: duplicateEmail, error: emailCheckError } = await supabase
        .from('teachers')
        .select('email')
        .eq('email', teacherData.email)
        .maybeSingle();
      
      if (emailCheckError) throw emailCheckError;
      
      if (duplicateEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }
    
    // Update teacher
    const { data, error } = await supabase
      .from('teachers')
      .update(teacherData)
      .eq('teacher_id', id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if teacher exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('*')
      .eq('teacher_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    // Check for references in other tables (classes, subjects)
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('class_id')
      .eq('teacher_id', id)
      .limit(1);
    
    if (classesError) throw classesError;
    
    if (classesData && classesData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete teacher with associated classes',
        count: classesData.length
      });
    }
    
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('subject_id')
      .eq('teacher_id', id)
      .limit(1);
    
    if (subjectsError) throw subjectsError;
    
    if (subjectsData && subjectsData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete teacher with associated subjects',
        count: subjectsData.length
      });
    }
    
    // Delete teacher
    const { error: deleteError } = await supabase
      .from('teachers')
      .delete()
      .eq('teacher_id', id);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

export default router;