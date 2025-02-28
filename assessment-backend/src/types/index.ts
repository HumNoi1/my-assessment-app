// assessment-backend/src/types/index.ts

export interface Teacher {
    teacher_id: string;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Class {
    class_id: string;
    class_name: string;
    academic_year: string;
    teacher_id: string;
    teacher?: Teacher;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Student {
    student_id: string;
    name: string;
    email: string;
    class_id: string;
    class?: Class;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Term {
    term_id: string;
    term_name: string;
    start_date: string;
    end_date: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Subject {
    subject_id: string;
    subject_name: string;
    subject_code: string;
    teacher_id: string;
    class_id: string;
    teacher?: Teacher;
    class?: Class;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface SubjectTerm {
    subject_id: string;
    term_id: string;
    subject?: Subject;
    term?: Term;
    created_at?: string;
  }
  
  export interface Folder {
    folder_id: string;
    folder_name: string;
    teacher_id: string;
    subject_id: string;
    teacher?: Teacher;
    subject?: Subject;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface AnswerKey {
    answer_key_id: string;
    file_name: string;
    content: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
    milvus_collection_name: string;
    subject_id: string;
    term_id: string;
    subject?: Subject;
    term?: Term;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface StudentAnswer {
    student_answer_id: string;
    file_name: string;
    content: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
    milvus_collection_name: string;
    student_id: string;
    answer_key_id: string;
    folder_id: string;
    student?: Student;
    answer_key?: AnswerKey;
    folder?: Folder;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Assessment {
    assessment_id: string;
    student_answer_id: string;
    answer_key_id: string;
    score: number;
    max_score: number;
    feedback_text?: string;
    feedback_json?: Record<string, unknown>;
    confidence: number;
    is_approved: boolean;
    approved_by?: string;
    assessment_date: string;
    student_answer?: StudentAnswer;
    answer_key?: AnswerKey;
    approver?: Teacher;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface LlmUsageLog {
    log_id: string;
    operation_type: string;
    input_prompt: string;
    output_text: string;
    processing_time: number;
    token_count: number;
    token_cost?: number;
    assessment_id?: string;
    assessment?: Assessment;
    created_at?: string;
  }
  
  // DTO (Data Transfer Objects) สำหรับการสร้างข้อมูลใหม่
  
  export interface CreateTeacherDto {
    name: string;
    email: string;
  }
  
  export interface CreateClassDto {
    class_name: string;
    academic_year: string;
    teacher_id: string;
  }
  
  export interface CreateStudentDto {
    name: string;
    email: string;
    class_id: string;
  }
  
  export interface CreateTermDto {
    term_name: string;
    start_date: string;
    end_date: string;
  }
  
  export interface CreateSubjectDto {
    subject_name: string;
    subject_code: string;
    teacher_id: string;
    class_id: string;
  }
  
  export interface CreateSubjectTermDto {
    subject_id: string;
    term_id: string;
  }
  
  export interface CreateFolderDto {
    folder_name: string;
    teacher_id: string;
    subject_id: string;
  }
  
  export interface CreateAnswerKeyDto {
    file_name: string;
    content: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
    subject_id: string;
    term_id: string;
  }
  
  export interface CreateStudentAnswerDto {
    file_name: string;
    content: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
    student_id: string;
    answer_key_id: string;
    folder_id: string;
  }
  
  export interface CreateAssessmentDto {
    student_answer_id: string;
    answer_key_id: string;
    score: number;
    max_score: number;
    feedback_text?: string;
    feedback_json?: Record<string, unknown>;
    confidence: number;
  }
  
  export interface ApproveAssessmentDto {
    is_approved: boolean;
    approved_by: string;
  }
  
  export interface CreateLlmUsageLogDto {
    operation_type: string;
    input_prompt: string;
    output_text: string;
    processing_time: number;
    token_count: number;
    token_cost?: number;
    assessment_id?: string;
  }