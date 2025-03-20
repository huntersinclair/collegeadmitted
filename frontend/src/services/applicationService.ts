import { supabase } from '@/lib/supabaseClient';
import {
  Application,
  ApplicationCourse,
  ApplicationHonor,
  ApplicationTestScore,
  ApplicationActivity,
  ApplicationEssay,
  ApplicationAdditionalInfo,
  ApplicationFile,
  University,
  UniversityProgram,
  College
} from '@/types/application';

export class ApplicationService {
  static async getUniversities(): Promise<University[]> {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async getUniversityPrograms(universityId: string): Promise<UniversityProgram[]> {
    const { data, error } = await supabase
      .from('university_majors')
      .select('*')
      .eq('university_id', universityId)
      .order('choice_label');
    
    if (error) throw error;
    return data;
  }

  static async getUserApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities(*),
        university_majors!applications_program_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getApplication(id: string): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities(*),
        university_majors!applications_program_id_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createApplication(application: Partial<Application>): Promise<Application> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to create an application');
    }

    const { data, error } = await supabase
      .from('applications')
      .insert([{
        ...application,
        user_id: user.id,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*, universities(*), university_programs(*)')
      .single();
    
    if (error) {
      console.error('Error creating application:', error);
      throw new Error('Failed to create application');
    }

    return data;
  }

  static async updateApplication(id: string, application: Partial<Application>): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .update(application)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteApplication(id: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Courses
  static async getApplicationCourses(applicationId: string): Promise<ApplicationCourse[]> {
    const { data, error } = await supabase
      .from('application_courses')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async addCourse(course: Partial<ApplicationCourse>): Promise<ApplicationCourse> {
    const { data, error } = await supabase
      .from('application_courses')
      .insert([course])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('application_courses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Honors
  static async getApplicationHonors(applicationId: string): Promise<ApplicationHonor[]> {
    const { data, error } = await supabase
      .from('application_honors')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async addHonor(honor: Partial<ApplicationHonor>): Promise<ApplicationHonor> {
    const { data, error } = await supabase
      .from('application_honors')
      .insert([honor])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteHonor(id: string): Promise<void> {
    const { error } = await supabase
      .from('application_honors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Test Scores
  static async getApplicationTestScores(applicationId: string): Promise<ApplicationTestScore[]> {
    const { data, error } = await supabase
      .from('application_test_scores')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async addTestScore(testScore: Partial<ApplicationTestScore>): Promise<ApplicationTestScore> {
    const { data, error } = await supabase
      .from('application_test_scores')
      .insert([testScore])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteTestScore(id: string): Promise<void> {
    const { error } = await supabase
      .from('application_test_scores')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Activities
  static async getApplicationActivities(applicationId: string): Promise<ApplicationActivity[]> {
    const { data, error } = await supabase
      .from('application_activities')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async addActivity(activity: Partial<ApplicationActivity>): Promise<ApplicationActivity> {
    const { data, error } = await supabase
      .from('application_activities')
      .insert([activity])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('application_activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Essays
  static async getApplicationEssays(applicationId: string): Promise<ApplicationEssay[]> {
    const { data, error } = await supabase
      .from('application_essays')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async addEssay(essay: Partial<ApplicationEssay>): Promise<ApplicationEssay> {
    const { data, error } = await supabase
      .from('application_essays')
      .insert([essay])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateEssay(id: string, essay: Partial<ApplicationEssay>): Promise<ApplicationEssay> {
    const { data, error } = await supabase
      .from('application_essays')
      .update(essay)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteEssay(id: string): Promise<void> {
    const { error } = await supabase
      .from('application_essays')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Additional Info
  static async getAdditionalInfo(applicationId: string): Promise<ApplicationAdditionalInfo | null> {
    const { data, error } = await supabase
      .from('application_additional_info')
      .select('*')
      .eq('application_id', applicationId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateAdditionalInfo(info: Partial<ApplicationAdditionalInfo>): Promise<ApplicationAdditionalInfo> {
    const { data, error } = await supabase
      .from('application_additional_info')
      .upsert([info])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Files
  static async getApplicationFiles(applicationId: string): Promise<ApplicationFile[]> {
    const { data, error } = await supabase
      .from('application_files')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  }

  static async uploadFile(
    applicationId: string,
    file: File,
    fileType: string
  ): Promise<ApplicationFile> {
    // Upload file to Supabase Storage
    const { error: storageError } = await supabase
      .storage
      .from('application-files')
      .upload(`${applicationId}/${file.name}`, file);

    if (storageError) throw storageError;

    // Create file record in database
    const { data, error } = await supabase
      .from('application_files')
      .insert([{
        application_id: applicationId,
        file_type: fileType,
        original_filename: file.name,
        processing_status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async processFile(fileId: string): Promise<void> {
    const response = await fetch('/api/process-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      throw new Error('Failed to process file');
    }
  }

  static async deleteFile(id: string): Promise<void> {
    // Get file info first
    const { data: fileData, error: fetchError } = await supabase
      .from('application_files')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('application-files')
      .remove([`${fileData.application_id}/${fileData.original_filename}`]);

    if (storageError) throw storageError;

    // Delete from database
    const { error } = await supabase
      .from('application_files')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getColleges(): Promise<College[]> {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }
} 