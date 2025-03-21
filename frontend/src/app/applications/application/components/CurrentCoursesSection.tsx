'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  styled,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { CurrentCourse, COURSE_SUBJECTS, COURSE_LEVELS, CourseSubject, CourseLevel } from '@/types/application';
import { useSupabase } from '@/app/supabase-provider';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

interface CurrentCoursesSectionProps {
  applicationId: string;
  initialCourses?: CurrentCourse[];
  onUpdate: () => void;
}

export function CurrentCoursesSection({
  applicationId,
  initialCourses = [],
  onUpdate,
}: CurrentCoursesSectionProps) {
  const { supabase } = useSupabase();
  const [courses, setCourses] = useState<CurrentCourse[]>(initialCourses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState<CourseSubject>(COURSE_SUBJECTS[0]);
  const [name, setName] = useState('');
  const [courseLevel, setCourseLevel] = useState<CourseLevel>(COURSE_LEVELS[0]);
  const [loading, setLoading] = useState(false);

  const handleAddCourse = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('current_courses')
        .insert({
          application_id: applicationId,
          subject,
          name,
          course_level: courseLevel,
        })
        .select()
        .single();

      if (error) throw error;

      setCourses([...courses, data]);
      setDialogOpen(false);
      setName('');
      onUpdate();
    } catch (error) {
      console.error('Error adding course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('current_courses')
        .delete()
        .match({ id });

      if (error) throw error;

      setCourses(courses.filter(c => c.id !== id));
      onUpdate();
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current or Most Recent Year Courses
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Please list all courses you are taking this academic year. If you are not currently enrolled, please list courses from your most recent academic year.
        </Typography>
      </Box>

      {courses.map((course) => (
        <Box
          key={course.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="subtitle1">
              {course.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {course.subject} • {course.course_level}
            </Typography>
          </Box>
          <IconButton
            onClick={() => handleDeleteCourse(course.id)}
            disabled={loading}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setDialogOpen(true)}
        disabled={loading}
      >
        Add Course
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Course</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Subject</FormLabel>
              <TextField
                select
                value={subject}
                onChange={(e) => setSubject(e.target.value as CourseSubject)}
                variant="outlined"
                sx={{ backgroundColor: '#ffffff' }}
              >
                {COURSE_SUBJECTS.map((subj) => (
                  <MenuItem key={subj} value={subj}>
                    {subj}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Course Name</FormLabel>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                placeholder="e.g., Advanced Biology"
                sx={{ backgroundColor: '#ffffff' }}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Course Level</FormLabel>
              <TextField
                select
                value={courseLevel}
                onChange={(e) => setCourseLevel(e.target.value as CourseLevel)}
                variant="outlined"
                sx={{ backgroundColor: '#ffffff' }}
              >
                {COURSE_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddCourse}
            variant="contained"
            disabled={!name || loading}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
} 