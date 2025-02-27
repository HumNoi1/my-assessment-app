// assessment-backend/src/api/routes/class-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { Class, CreateClassDto } from '../../types';

const router = Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        teacher:teachers(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get classes by teacher ID
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        teacher:teachers(*)
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching classes by teacher:', error);
    res.status(500).json({ error: 'Failed to fetch classes by teacher' });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        teacher:teachers(*)
      `)
      .eq('class_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Class not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Create new class
router.post('/', async (req, res) => {
  try {
    const classData: CreateClassDto = req.body;
    
    // Validate required fields
    if (!classData.class_name || !classData.academic_year || !classData.teacher_id) {
      return res.status(400).json({ error: 'Class name, academic year, and teacher ID are required' });
    }
    
    // Check if teacher exists
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('teacher_id', classData.teacher_id)
      .single();
    
    if (teacherError || !teacherData) {
      return res.status(400).json({ error: 'Teacher not found' });
    }
    
    // Insert new class
    const { data, error } = await supabase
      .from('classes')
      .insert(classData)
      .select(`
        *,
        teacher:teachers(*)
      `);
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const classData: Partial<Class> = req.body;
    
    // Remove immutable fields if present
    delete classData.class_id;
    delete classData.created_at;
    
    // Check if class exists
    const { data: existingClass, error: checkError } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if teacher exists if teacher_id is being updated
    if (classData.teacher_id && classData.teacher_id !== existingClass.teacher_id) {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('teacher_id')
        .eq('teacher_id', classData.teacher_id)
        .single();
      
      if (teacherError || !teacherData) {
        return res.status(400).json({ error: 'Teacher not found' });
      }
    }
    
    // Update class
    const { data, error } = await supabase
      .from('classes')
      .update(classData)
      .eq('class_id', id)
      .select(`
        *,
        teacher:teachers(*)
      `);
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if class exists
    const { data: existingClass, error: checkError } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check for references in other tables (students, subjects)
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('student_id')
      .eq('class_id', id)
      .limit(1);
    
    if (studentsError) throw studentsError;
    
    if (studentsData && studentsData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete class with associated students',
        count: studentsData.length
      });
    }
    
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('subject_id')
      .eq('class_id', id)
      .limit(1);
    
    if (subjectsError) throw subjectsError;
    
    if (subjectsData && subjectsData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete class with associated subjects',
        count: subjectsData.length
      });
    }
    
    // Delete class
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('class_id', id);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

export default router;