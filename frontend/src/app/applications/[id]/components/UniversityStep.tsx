'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  MenuItem,
  Paper,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { Application, University, UniversityProgram } from '@/types/application';
import { ApplicationService } from '@/services/applicationService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

interface UniversityStepProps {
  application: Application;
  onSave: (data: Partial<Application>) => Promise<void>;
}

export function UniversityStep({ application, onSave }: UniversityStepProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<UniversityProgram[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | undefined>(
    application.university_id
  );
  const [selectedProgram, setSelectedProgram] = useState<string | undefined>(
    application.program_id
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      loadPrograms(selectedUniversity);
    } else {
      setPrograms([]);
      setSelectedProgram(undefined);
    }
  }, [selectedUniversity]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      const data = await ApplicationService.getUniversities();
      setUniversities(data);
      setError(null);
    } catch (err) {
      setError('Failed to load universities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async (universityId: string) => {
    try {
      setLoading(true);
      const data = await ApplicationService.getUniversityPrograms(universityId);
      setPrograms(data);
      setError(null);
    } catch (err) {
      setError('Failed to load programs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        university_id: selectedUniversity,
        program_id: selectedProgram,
        status: selectedUniversity && selectedProgram ? 'in_progress' : 'draft',
      });
      setError(null);
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledPaper>
      {error && (
        <Box mb={3} p={2} bgcolor="error.light" borderRadius={1}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Box display="grid" gap={3}>
        <FormControl fullWidth>
          <FormLabel>Select University</FormLabel>
          <TextField
            select
            value={selectedUniversity || ''}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            variant="outlined"
            sx={{ backgroundColor: '#ffffff' }}
          >
            <MenuItem value="">Choose a university</MenuItem>
            {universities.map((university) => (
              <MenuItem key={university.id} value={university.id}>
                {university.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        {selectedUniversity && (
          <FormControl fullWidth>
            <FormLabel>Select Program</FormLabel>
            <TextField
              select
              value={selectedProgram || ''}
              onChange={(e) => setSelectedProgram(e.target.value)}
              variant="outlined"
              sx={{ backgroundColor: '#ffffff' }}
            >
              <MenuItem value="">Choose a program</MenuItem>
              {programs.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.name} ({program.degree_type})
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        )}
      </Box>

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving && <CircularProgress size={20} />}
        >
          {saving ? 'Saving...' : 'Save and Continue'}
        </Button>
      </Box>
    </StyledPaper>
  );
} 