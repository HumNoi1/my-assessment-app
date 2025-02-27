// assessment-backend/src/api/routes/student-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { Student, CreateStudentDto } from '../../types';

const router = Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .order('name', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get students by class ID
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('class_id', classId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching students by class:', error);
    res.status(500).json({ error: 'Failed to fetch students by class' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('student_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Student not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const studentData: CreateStudentDto = req.body;
    
    // Validate required fields
    if (!studentData.name || !studentData.email || !studentData.class_id) {
      return res.status(400).json({ 
        error: 'Student name, email, and class ID are required' 
      });
    }
    
    // Check if email already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('email')
      .eq('email', studentData.email)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingStudent) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Check if class exists
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('class_id')
      .eq('class_id', studentData.class_id)
      .single();
    
    if (classError || !classData) {
      return res.status(400).json({ error: 'Class not found' });
    }
    
    // Insert new student
    const { data, error } = await supabase
      .from('students')
      .insert(studentData)
      .select(`
        *,
        class:classes(*)
      `);
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const studentData: Partial<Student> = req.body;
    
    // Remove immutable fields if present
    delete studentData.student_id;
    delete studentData.created_at;
    
    // Check if student exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if email already exists for another student
    if (studentData.email && studentData.email !== existingStudent.email) {
      const { data: duplicateEmail, error: emailCheckError } = await supabase
        .from('students')
        .select('email')
        .eq('email', studentData.email)
        .maybeSingle();
      
      if (emailCheckError) throw emailCheckError;
      
      if (duplicateEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }
    
    // Check if class exists if class_id is being updated
    if (studentData.class_id && studentData.class_id !== existingStudent.class_id) {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('class_id')
        .eq('class_id', studentData.class_id)
        .single();
      
      if (classError || !classData) {
        return res.status(400).json({ error: 'Class not found' });
      }
    }
    
    // Update student
    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('student_id', id)
      .select(`
        *,
        class:classes(*)
      `);
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check for references in student_answers
    const { data: studentAnswersData, error: studentAnswersError } = await supabase
      .from('student_answers')
      .select('student_answer_id')
      .eq('student_id', id)
      .limit(1);
    
    if (studentAnswersError) throw studentAnswersError;
    
    if (studentAnswersData && studentAnswersData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete student with associated answers',
        count: studentAnswersData.length
      });
    }
    
    // Delete student
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('student_id', id);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;