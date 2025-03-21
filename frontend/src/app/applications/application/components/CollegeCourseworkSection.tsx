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
  Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { CollegeCoursework } from '@/types/application';
import { useSupabase } from '@/app/supabase-provider';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

interface College {
  id: string;
  name: string;
  city?: string;
  displayName: string;
}

interface CollegeCourseworkSectionProps {
  applicationId: string;
  initialCoursework?: CollegeCoursework[];
  onUpdate: () => void;
}

export function CollegeCourseworkSection({
  applicationId,
  initialCoursework = [],
  onUpdate,
}: CollegeCourseworkSectionProps) {
  const { supabase } = useSupabase();
  const [coursework, setCoursework] = useState<CollegeCoursework[]>(initialCoursework);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [programType, setProgramType] = useState<CollegeCoursework['program_type']>('dual_enrollment');
  const [earnedDegree, setEarnedDegree] = useState<CollegeCoursework['earned_degree']>('None');
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  const loadColleges = async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error loading colleges:', error);
      return;
    }

    // Process colleges to create unique display names
    const processedColleges = (data || []).map(college => ({
      ...college,
      displayName: college.city ? `${college.name} - ${college.city}` : college.name
    }));

    // Remove duplicates by keeping only the first occurrence of each displayName
    const uniqueColleges = processedColleges.reduce((acc: College[], current: College) => {
      const exists = acc.find((item: College) => item.displayName === current.displayName);
      if (!exists) {
        acc.push(current);
      } else {
        console.log(`Duplicate college found and removed: ${current.displayName}`);
      }
      return acc;
    }, [] as College[]);

    // Sort colleges by display name
    const sortedColleges = uniqueColleges.sort((a: College, b: College) => 
      a.displayName.localeCompare(b.displayName)
    );

    setColleges(sortedColleges);
  };

  const handleAddCoursework = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('college_coursework')
        .insert({
          application_id: applicationId,
          college_id: selectedCollege?.id,
          program_type: programType,
          earned_degree: earnedDegree,
        })
        .select()
        .single();

      if (error) throw error;

      setCoursework([...coursework, data]);
      setDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding coursework:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoursework = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('college_coursework')
        .delete()
        .match({ id });

      if (error) throw error;

      setCoursework(coursework.filter(c => c.id !== id));
      onUpdate();
    } catch (error) {
      console.error('Error deleting coursework:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          College Coursework
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          If you have ever taken coursework at a college or university, please add the details below.
        </Typography>
      </Box>

      {coursework.map((course) => (
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
              {colleges.find(c => c.id === course.college_id)?.displayName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {course.program_type.replace('_', ' ')} • {course.earned_degree}
            </Typography>
          </Box>
          <IconButton
            onClick={() => handleDeleteCoursework(course.id)}
            disabled={loading}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          loadColleges();
          setDialogOpen(true);
        }}
        disabled={loading}
      >
        Add College
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add College Coursework</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Name of College</FormLabel>
              <Autocomplete
                value={selectedCollege}
                onChange={(_, newValue) => setSelectedCollege(newValue)}
                options={colleges}
                getOptionLabel={(option) => option.displayName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Search for a college..."
                    sx={{ backgroundColor: '#ffffff' }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Type of Program</FormLabel>
              <TextField
                select
                value={programType}
                onChange={(e) => setProgramType(e.target.value as CollegeCoursework['program_type'])}
                variant="outlined"
                sx={{ backgroundColor: '#ffffff' }}
              >
                <MenuItem value="dual_enrollment">Dual Enrollment with High School</MenuItem>
                <MenuItem value="summer_program">Summer Program</MenuItem>
                <MenuItem value="credit_awarded">Credit Awarded Directly by College</MenuItem>
              </TextField>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Earned Degree</FormLabel>
              <TextField
                select
                value={earnedDegree}
                onChange={(e) => setEarnedDegree(e.target.value as CollegeCoursework['earned_degree'])}
                variant="outlined"
                sx={{ backgroundColor: '#ffffff' }}
              >
                <MenuItem value="AA">AA</MenuItem>
                <MenuItem value="AS">AS</MenuItem>
                <MenuItem value="BA">BA</MenuItem>
                <MenuItem value="BS">BS</MenuItem>
                <MenuItem value="None">None</MenuItem>
              </TextField>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddCoursework}
            variant="contained"
            disabled={!selectedCollege || loading}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
} 