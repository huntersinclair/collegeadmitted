'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Paper,
  TextField,
  Typography,
  styled,
  Autocomplete,
} from '@mui/material';
import { Application, University, UniversityProgram } from '@/types/application';
import { ApplicationService } from '@/services/applicationService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

interface UniversityWithDisplay extends University {
  displayName: string;
}

interface ProgramWithDisplay extends UniversityProgram {
  displayName: string;
}

interface UniversityStepProps {
  application: Application;
  onSave: (data: Partial<Application>) => Promise<void>;
}

export function UniversityStep({ application, onSave }: UniversityStepProps) {
  const [universities, setUniversities] = useState<UniversityWithDisplay[]>([]);
  const [programs, setPrograms] = useState<ProgramWithDisplay[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | undefined>(
    application.university_id
  );
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithDisplay | null>(
    null
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
      setSelectedProgram(null);
    }
  }, [selectedUniversity]);

  // Initialize selected program when programs are loaded
  useEffect(() => {
    if (application.program_id && programs.length > 0) {
      const program = programs.find(p => p.id === application.program_id);
      if (program) {
        setSelectedProgram(program);
      }
    }
  }, [programs, application.program_id]);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      const data = await ApplicationService.getUniversities();
      
      // Process universities to create unique display names
      const processedUniversities = data.map(university => ({
        ...university,
        displayName: university.city ? `${university.name} - ${university.city}` : university.name
      }));

      // Remove duplicates by keeping only the first occurrence of each displayName
      const uniqueUniversities = processedUniversities.reduce((acc: UniversityWithDisplay[], current: UniversityWithDisplay) => {
        const exists = acc.find((item: UniversityWithDisplay) => item.displayName === current.displayName);
        if (!exists) {
          acc.push(current);
        } else {
          console.log(`Duplicate university found and removed: ${current.displayName}`);
        }
        return acc;
      }, [] as UniversityWithDisplay[]);

      // Sort universities by display name
      const sortedUniversities = uniqueUniversities.sort((a: UniversityWithDisplay, b: UniversityWithDisplay) => 
        a.displayName.localeCompare(b.displayName)
      );

      setUniversities(sortedUniversities);
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
      
      // Process programs to create unique display names
      const processedPrograms = data.map(program => ({
        ...program,
        displayName: program.choice_label + (program.major_group ? ` (${program.major_group})` : '')
      }));

      // Create a map to track duplicate names
      const nameCount = new Map<string, number>();
      processedPrograms.forEach(program => {
        const count = nameCount.get(program.displayName) || 0;
        nameCount.set(program.displayName, count + 1);
      });

      // Add member export code to duplicates
      const uniquePrograms = processedPrograms.map(program => {
        if (nameCount.get(program.displayName)! > 1) {
          return {
            ...program,
            displayName: `${program.displayName} [${program.member_export_code || 'No Code'}]`
          };
        }
        return program;
      });

      // Sort programs by display name
      const sortedPrograms = uniquePrograms.sort((a, b) => 
        a.displayName.localeCompare(b.displayName)
      );

      setPrograms(sortedPrograms);
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
        program_id: selectedProgram?.id,
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
          <Autocomplete
            value={universities.find(u => u.id === selectedUniversity) || null}
            onChange={(_, newValue) => setSelectedUniversity(newValue?.id || '')}
            options={universities}
            getOptionLabel={(option) => option.displayName}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search for a university..."
                sx={{ backgroundColor: '#ffffff' }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </FormControl>

        {selectedUniversity && (
          <FormControl fullWidth>
            <FormLabel>Select Program</FormLabel>
            <Autocomplete
              value={selectedProgram}
              onChange={(_, newValue) => setSelectedProgram(newValue)}
              options={programs}
              getOptionLabel={(option) => option.displayName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Search for a program..."
                  sx={{ backgroundColor: '#ffffff' }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
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