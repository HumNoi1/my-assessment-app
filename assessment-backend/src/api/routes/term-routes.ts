// assessment-backend/src/api/routes/term-routes.ts
import { Router } from 'express';
import { supabase } from '../../services/supabase/client';
import { Term, CreateTermDto } from '../../types';

const router = Router();

// Get all terms
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('terms')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching terms:', error);
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// Get term by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('terms')
      .select('*')
      .eq('term_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Term not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching term:', error);
    res.status(500).json({ error: 'Failed to fetch term' });
  }
});

// Create new term
router.post('/', async (req, res) => {
  try {
    const termData: CreateTermDto = req.body;
    
    // Validate required fields
    if (!termData.term_name || !termData.start_date || !termData.end_date) {
      return res.status(400).json({ 
        error: 'Term name, start date, and end date are required' 
      });
    }
    
    // Validate date format and logic
    const startDate = new Date(termData.start_date);
    const endDate = new Date(termData.end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (endDate <= startDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Insert new term
    const { data, error } = await supabase
      .from('terms')
      .insert(termData)
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating term:', error);
    res.status(500).json({ error: 'Failed to create term' });
  }
});

// Update term
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const termData: Partial<Term> = req.body;
    
    // Remove immutable fields if present
    delete termData.term_id;
    delete termData.created_at;
    
    // Check if term exists
    const { data: existingTerm, error: checkError } = await supabase
      .from('terms')
      .select('*')
      .eq('term_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingTerm) {
      return res.status(404).json({ error: 'Term not found' });
    }
    
    // Validate dates if provided
    if (termData.start_date || termData.end_date) {
      const startDate = new Date(termData.start_date || existingTerm.start_date);
      const endDate = new Date(termData.end_date || existingTerm.end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      if (endDate <= startDate) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }
    
    // Update term
    const { data, error } = await supabase
      .from('terms')
      .update(termData)
      .eq('term_id', id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating term:', error);
    res.status(500).json({ error: 'Failed to update term' });
  }
});

// Delete term
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if term exists
    const { data: existingTerm, error: checkError } = await supabase
      .from('terms')
      .select('*')
      .eq('term_id', id)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (!existingTerm) {
      return res.status(404).json({ error: 'Term not found' });
    }
    
    // Check for references in other tables (subject_term, answer_keys)
    const { data: subjectTermData, error: subjectTermError } = await supabase
      .from('subject_term')
      .select('subject_id')
      .eq('term_id', id)
      .limit(1);
    
    if (subjectTermError) throw subjectTermError;
    
    if (subjectTermData && subjectTermData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete term with associated subjects',
        count: subjectTermData.length
      });
    }
    
    const { data: answerKeysData, error: answerKeysError } = await supabase
      .from('answer_keys')
      .select('answer_key_id')
      .eq('term_id', id)
      .limit(1);
    
    if (answerKeysError) throw answerKeysError;
    
    if (answerKeysData && answerKeysData.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete term with associated answer keys',
        count: answerKeysData.length
      });
    }
    
    // Delete term
    const { error: deleteError } = await supabase
      .from('terms')
      .delete()
      .eq('term_id', id);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting term:', error);
    res.status(500).json({ error: 'Failed to delete term' });
  }
});

export default router;