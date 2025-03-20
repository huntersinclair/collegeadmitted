'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  MenuItem,
  Checkbox,
  FormGroup,
  Button,
  Box,
  Typography,
  Paper,
  styled,
  Theme,
  Chip,
  Stack,
} from '@mui/material';
import { Application, GPAScale, DegreeType } from '@/types/application';
import { CircularProgress } from '@mui/material';
import { useSupabase } from '@/app/supabase-provider';

// Styled components for consistent styling
const StyledPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

const StyledSelect = styled(TextField)({
  '& .MuiSelect-select': {
    backgroundColor: '#ffffff',
  },
});

interface AcademicStepProps {
  application: Application;
  onSave: (data: Partial<Application>) => Promise<void>;
}

interface FormData {
  languages_count?: number;
  graduated_secondary?: boolean;
  progression_options?: string[];
  colleges_attended?: string[];
  class_size?: number;
  class_rank?: number;
  class_rank_percentile?: number;
  rank_weighting?: 'weighted' | 'unweighted';
  gpa_scale?: GPAScale;
  cumulative_gpa?: number;
  gpa_weighting?: 'weighted' | 'unweighted';
  highest_degree_intended?: DegreeType;
  career_interest?: string;
}

const languageOptions = Array.from({ length: 10 }, (_, i) => i + 1);

const progressionOptions = [
  'Did or will graduate early',
  'Did or will graduate late',
  'Did or will take time off',
  'Did or will take gap year',
  'No change in progression'
];

const degreeTypes: DegreeType[] = [
  "Associate's (AA, AS)",
  "Bachelor's (BA, BS)",
  "Master's (MA, MS)",
  'Business (MBA, MAcc)',
  'Law (JD, LLM)',
  'Medicine (MD, DO, DVM, DDS)',
  'Doctorate (PhD, EdD, etc)',
  'Other',
  'Undecided',
];

const gpaScales: GPAScale[] = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
  '15', '16', '17', '18', '19', '20', '100', 'none',
];

export function AcademicStep({ application, onSave }: AcademicStepProps) {
  const { supabase } = useSupabase();
  const [formData, setFormData] = useState<FormData>({
    languages_count: application.languages_count,
    graduated_secondary: application.graduated_secondary,
    progression_options: application.progression_options || [],
    colleges_attended: application.colleges_attended || [],
    class_size: application.class_size,
    class_rank: application.class_rank,
    class_rank_percentile: application.class_rank_percentile,
    rank_weighting: application.rank_weighting as 'weighted' | 'unweighted',
    gpa_scale: application.gpa_scale,
    cumulative_gpa: application.cumulative_gpa,
    gpa_weighting: application.gpa_weighting as 'weighted' | 'unweighted',
    highest_degree_intended: application.highest_degree_intended,
    career_interest: application.career_interest,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colleges, setColleges] = useState<Array<{ id: string; name: string }>>([]);
  const [newCollege, setNewCollege] = useState('');

  const loadColleges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      if (error) throw error;
      setColleges(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading colleges:', err);
      setError('Failed to load colleges');
    }
  }, [supabase]);

  const handleChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProgressionChange = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      progression_options: prev.progression_options?.includes(option)
        ? prev.progression_options.filter(item => item !== option)
        : [...(prev.progression_options || []), option]
    }));
  };

  const handleAddCollege = (collegeId: string) => {
    if (!formData.colleges_attended?.includes(collegeId)) {
      setFormData((prev) => ({
        ...prev,
        colleges_attended: [...(prev.colleges_attended || []), collegeId]
      }));
    }
    setNewCollege('');
  };

  const handleRemoveCollege = (collegeId: string) => {
    setFormData((prev) => ({
      ...prev,
      colleges_attended: prev.colleges_attended?.filter(id => id !== collegeId) || []
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        ...formData,
        status: 'in_progress',
      });
      setError(null);
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      {error && (
        <StyledPaper sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </StyledPaper>
      )}

      <StyledPaper>
        <Box sx={{ display: 'grid', gap: 3 }}>
          <FormControl fullWidth>
            <FormLabel>Number of languages you are proficient in</FormLabel>
            <StyledSelect
              select
              value={formData.languages_count || ''}
              onChange={(e) => handleChange('languages_count', Number(e.target.value))}
              variant="outlined"
            >
              {languageOptions.map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>

          <FormControl>
            <FormLabel>Did or will you graduate from a secondary/high-school school?</FormLabel>
            <RadioGroup
              value={formData.graduated_secondary || false}
              onChange={(e) => handleChange('graduated_secondary', e.target.value === 'true')}
            >
              <FormControlLabel value={true} control={<Radio />} label="Yes" />
              <FormControlLabel value={false} control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>
              Please indicate if any of these options will have affected your progression through or since secondary/high school
            </FormLabel>
            <FormGroup>
              {progressionOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={formData.progression_options?.includes(option) || false}
                      onChange={() => handleProgressionChange(option)}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Previous Colleges Attended</FormLabel>
            <StyledSelect
              select
              value={newCollege}
              onChange={(e) => handleAddCollege(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Select a college</MenuItem>
              {colleges
                .filter(college => !formData.colleges_attended?.includes(college.id))
                .map((college) => (
                  <MenuItem key={college.id} value={college.id}>
                    {college.name}
                  </MenuItem>
                ))}
            </StyledSelect>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {formData.colleges_attended?.map((collegeId) => {
                const college = colleges.find(c => c.id === collegeId);
                return college ? (
                  <Chip
                    key={college.id}
                    label={college.name}
                    onDelete={() => handleRemoveCollege(college.id)}
                    sx={{ mb: 1 }}
                  />
                ) : null;
              })}
            </Stack>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Class Size</FormLabel>
            <TextField
              type="number"
              value={formData.class_size || ''}
              onChange={(e) => handleChange('class_size', Number(e.target.value))}
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Class Rank</FormLabel>
            <TextField
              type="number"
              value={formData.class_rank || ''}
              onChange={(e) => handleChange('class_rank', Number(e.target.value))}
              variant="outlined"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Rank Weighting</FormLabel>
            <RadioGroup
              value={formData.rank_weighting || ''}
              onChange={(e) => handleChange('rank_weighting', e.target.value as 'weighted' | 'unweighted')}
            >
              <FormControlLabel value="weighted" control={<Radio />} label="Weighted" />
              <FormControlLabel value="unweighted" control={<Radio />} label="Unweighted" />
            </RadioGroup>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>GPA Scale</FormLabel>
            <StyledSelect
              select
              value={formData.gpa_scale || ''}
              onChange={(e) => handleChange('gpa_scale', e.target.value as GPAScale)}
              variant="outlined"
            >
              {gpaScales.map((scale) => (
                <MenuItem key={scale} value={scale}>
                  {scale === 'none' ? 'No GPA Scale' : `${scale}-point scale`}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Cumulative GPA</FormLabel>
            <TextField
              type="number"
              inputProps={{ step: 0.01, min: 0 }}
              value={formData.cumulative_gpa || ''}
              onChange={(e) => handleChange('cumulative_gpa', Number(e.target.value))}
              variant="outlined"
            />
          </FormControl>

          <FormControl>
            <FormLabel>GPA Weighting</FormLabel>
            <RadioGroup
              value={formData.gpa_weighting || ''}
              onChange={(e) => handleChange('gpa_weighting', e.target.value as 'weighted' | 'unweighted')}
            >
              <FormControlLabel value="weighted" control={<Radio />} label="Weighted" />
              <FormControlLabel value="unweighted" control={<Radio />} label="Unweighted" />
            </RadioGroup>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Highest Degree Intended</FormLabel>
            <StyledSelect
              select
              value={formData.highest_degree_intended || ''}
              onChange={(e) => handleChange('highest_degree_intended', e.target.value as DegreeType)}
              variant="outlined"
            >
              {degreeTypes.map((degree) => (
                <MenuItem key={degree} value={degree}>
                  {degree}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Career Interest</FormLabel>
            <TextField
              value={formData.career_interest || ''}
              onChange={(e) => handleChange('career_interest', e.target.value)}
              variant="outlined"
              placeholder="e.g., Software Engineering, Medicine, Business, etc."
            />
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
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
    </Box>
  );
} 