'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Stack,
  Select,
  SelectChangeEvent,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Application } from '@/types/application';
import { useSupabase } from '@/app/supabase-provider';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

interface ActivitiesStepProps {
  application: Application;
  onSave: (data: Partial<Application>) => Promise<void>;
}

const ACTIVITY_TYPES = [
  { value: 'academic', label: 'Academic' },
  { value: 'art', label: 'Art' },
  { value: 'athletics', label: 'Athletics' },
  { value: 'career_oriented', label: 'Career-Oriented' },
  { value: 'community_service', label: 'Community Service' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'dance', label: 'Dance' },
  { value: 'debate_speech', label: 'Debate/Speech' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'family_responsibilities', label: 'Family Responsibilities' },
  { value: 'journalism_publication', label: 'Journalism/Publication' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'music', label: 'Music' },
  { value: 'religious', label: 'Religious' },
  { value: 'research', label: 'Research' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'school_spirit', label: 'School Spirit' },
  { value: 'science_math', label: 'Science/Math' },
  { value: 'student_govt', label: 'Student Government' },
  { value: 'theater_drama', label: 'Theater/Drama' },
  { value: 'work_paid', label: 'Work (Paid)' },
  { value: 'other', label: 'Other' },
];

const GRADES = [
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
  { value: 'post_graduate', label: 'Post-Graduate' },
];

const HONOR_LEVELS = [
  { value: 'school', label: 'School' },
  { value: 'state', label: 'State/Regional' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
];

type ActivityType =
  | 'academic'
  | 'art'
  | 'athletics'
  | 'career_oriented'
  | 'community_service'
  | 'cultural'
  | 'dance'
  | 'debate_speech'
  | 'environmental'
  | 'family_responsibilities'
  | 'journalism_publication'
  | 'leadership'
  | 'music'
  | 'religious'
  | 'research'
  | 'robotics'
  | 'school_spirit'
  | 'science_math'
  | 'student_govt'
  | 'theater_drama'
  | 'work_paid'
  | 'other';

type ParticipationGrade = '9' | '10' | '11' | '12' | 'post_graduate';

interface Activity {
  id?: string;
  position_title: string;
  organization_name: string;
  activity_type: ActivityType;
  participation_grades: ParticipationGrade[];
  hours_per_week: number;
  weeks_per_year: number;
  description: string;
  application_id?: string;
}

interface Honor {
  id?: string;
  honor_title: string;
  issuer: string;
  received_grade: string;
  level: string;
}

export function ActivitiesStep({ application, onSave }: ActivitiesStepProps) {
  const { supabase } = useSupabase();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [honors, setHonors] = useState<Honor[]>([]);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [honorDialogOpen, setHonorDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<Activity>({
    position_title: '',
    organization_name: '',
    activity_type: 'other',
    participation_grades: [],
    hours_per_week: 0,
    weeks_per_year: 0,
    description: '',
  });
  const [currentHonor, setCurrentHonor] = useState<Honor>({
    honor_title: '',
    issuer: '',
    received_grade: '',
    level: '',
  });

  const loadActivitiesAndHonors = useCallback(async () => {
    try {
      setLoading(true);
      const [activitiesResponse, honorsResponse] = await Promise.all([
        supabase
          .from('activities')
          .select('*')
          .eq('application_id', application.id)
          .order('created_at'),
        supabase
          .from('honors')
          .select('*')
          .eq('application_id', application.id)
          .order('created_at'),
      ]);

      if (activitiesResponse.error) throw activitiesResponse.error;
      if (honorsResponse.error) throw honorsResponse.error;

      setActivities(activitiesResponse.data || []);
      setHonors(honorsResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading activities and honors:', err);
      setError('Failed to load activities and honors');
    } finally {
      setLoading(false);
    }
  }, [supabase, application.id]);

  useEffect(() => {
    loadActivitiesAndHonors();
  }, [loadActivitiesAndHonors]);

  const handleActivitySubmit = async () => {
    try {
      setSaving(true);
      const activityData = {
        ...currentActivity,
        application_id: application.id,
        // Ensure number fields are actually numbers
        hours_per_week: Number(currentActivity.hours_per_week),
        weeks_per_year: Number(currentActivity.weeks_per_year),
      };
      
      console.log('Submitting activity data:', JSON.stringify(activityData, null, 2));
      
      // Validate participation_grades is not empty
      if (currentActivity.participation_grades.length === 0) {
        throw new Error('Please select at least one grade level');
      }

      const { data, error } = await supabase
        .from('activities')
        .insert(activityData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to add activity: ${error.message}`);
      }

      console.log('Activity added successfully:', JSON.stringify(data, null, 2));
      await loadActivitiesAndHonors();
      await onSave({ status: 'in_progress' });
      setActivityDialogOpen(false);
      setCurrentActivity({
        position_title: '',
        organization_name: '',
        activity_type: 'other',
        participation_grades: [],
        hours_per_week: 0,
        weeks_per_year: 0,
        description: '',
      });
    } catch (err) {
      console.error('Error adding activity:', err instanceof Error ? {
        message: err.message,
        stack: err.stack
      } : err);
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setSaving(false);
    }
  };

  const handleHonorSubmit = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('honors')
        .insert({
          ...currentHonor,
          application_id: application.id,
        });

      if (error) throw error;

      await loadActivitiesAndHonors();
      await onSave({ status: 'in_progress' });
      setHonorDialogOpen(false);
      setCurrentHonor({
        honor_title: '',
        issuer: '',
        received_grade: '',
        level: '',
      });
    } catch (err) {
      console.error('Error adding honor:', err);
      setError('Failed to add honor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadActivitiesAndHonors();
      await onSave({ status: 'in_progress' });
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHonor = async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('honors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadActivitiesAndHonors();
      await onSave({ status: 'in_progress' });
    } catch (err) {
      console.error('Error deleting honor:', err);
      setError('Failed to delete honor');
    } finally {
      setSaving(false);
    }
  };

  const handleResponseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);
    
    if (e.target.type === 'number') {
      if (e.target.name === 'hours_per_week') {
        setCurrentActivity({
          ...currentActivity,
          hours_per_week: isNaN(numValue) ? 0 : Math.min(168, Math.max(0, numValue)),
        });
      } else if (e.target.name === 'weeks_per_year') {
        setCurrentActivity({
          ...currentActivity,
          weeks_per_year: isNaN(numValue) ? 0 : Math.min(52, Math.max(0, numValue)),
        });
      }
    }
  };

  const handleParticipationGradesChange = (
    event: SelectChangeEvent<ParticipationGrade[]>
  ) => {
    const value = event.target.value as ParticipationGrade[];
    setCurrentActivity({
      ...currentActivity,
      participation_grades: value,
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      {error && (
        <StyledPaper sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </StyledPaper>
      )}

      <StyledPaper>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Activities</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setActivityDialogOpen(true)}
              disabled={saving}
            >
              Add Activity
            </Button>
          </Box>

          {activities.map((activity) => (
            <Box
              key={activity.id}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {activity.position_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.organization_name}
                  </Typography>
                  <Typography variant="body2">
                    {ACTIVITY_TYPES.find(t => t.value === activity.activity_type)?.label}
                  </Typography>
                  <Typography variant="body2">
                    {activity.hours_per_week} hrs/week, {activity.weeks_per_year} weeks/year
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {activity.participation_grades.map((grade) => (
                      <Chip
                        key={grade}
                        label={GRADES.find(g => g.value === grade)?.label}
                        size="small"
                      />
                    ))}
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {activity.description}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => activity.id && handleDeleteActivity(activity.id)}
                  disabled={saving}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Honors & Awards</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setHonorDialogOpen(true)}
              disabled={saving}
            >
              Add Honor
            </Button>
          </Box>

          {honors.map((honor) => (
            <Box
              key={honor.id}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {honor.honor_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {honor.issuer}
                  </Typography>
                  <Typography variant="body2">
                    {GRADES.find(g => g.value === honor.received_grade)?.label}
                  </Typography>
                  <Typography variant="body2">
                    Level: {HONOR_LEVELS.find(l => l.value === honor.level)?.label}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => honor.id && handleDeleteHonor(honor.id)}
                  disabled={saving}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </StyledPaper>

      {/* Activity Dialog */}
      <Dialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Activity</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Position/Leadership Title</FormLabel>
              <TextField
                value={currentActivity.position_title}
                onChange={(e) => setCurrentActivity({ ...currentActivity, position_title: e.target.value })}
                variant="outlined"
                placeholder="e.g., President, Captain, Member"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Organization Name</FormLabel>
              <TextField
                value={currentActivity.organization_name}
                onChange={(e) => setCurrentActivity({ ...currentActivity, organization_name: e.target.value })}
                variant="outlined"
                placeholder="e.g., Student Council, Chess Club"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Activity Type</FormLabel>
              <TextField
                select
                value={currentActivity.activity_type}
                onChange={(e) => setCurrentActivity({ ...currentActivity, activity_type: e.target.value as ActivityType })}
                variant="outlined"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Participation Grade Levels</FormLabel>
              <Select
                multiple
                value={currentActivity.participation_grades}
                onChange={handleParticipationGradesChange}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={GRADES.find(g => g.value === value)?.label}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {GRADES.map((grade) => (
                  <MenuItem key={grade.value} value={grade.value}>
                    <Checkbox checked={currentActivity.participation_grades.indexOf(grade.value as ParticipationGrade) > -1} />
                    <ListItemText primary={grade.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Hours Spent per Week</FormLabel>
              <TextField
                name="hours_per_week"
                type="number"
                value={currentActivity.hours_per_week}
                onChange={handleResponseChange}
                variant="outlined"
                inputProps={{ min: 0, max: 168 }}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Weeks Spent per Year</FormLabel>
              <TextField
                name="weeks_per_year"
                type="number"
                value={currentActivity.weeks_per_year}
                onChange={handleResponseChange}
                variant="outlined"
                inputProps={{ min: 0, max: 52 }}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Description</FormLabel>
              <TextField
                value={currentActivity.description}
                onChange={(e) => setCurrentActivity({ ...currentActivity, description: e.target.value })}
                variant="outlined"
                multiline
                rows={4}
                placeholder="Describe your responsibilities, accomplishments, and the impact of your involvement"
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleActivitySubmit}
            variant="contained"
            disabled={saving || !currentActivity.position_title || !currentActivity.organization_name}
          >
            {saving ? 'Adding...' : 'Add Activity'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Honor Dialog */}
      <Dialog
        open={honorDialogOpen}
        onClose={() => setHonorDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Honor/Award</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Honor/Award Title</FormLabel>
              <TextField
                value={currentHonor.honor_title}
                onChange={(e) => setCurrentHonor({ ...currentHonor, honor_title: e.target.value })}
                variant="outlined"
                placeholder="e.g., First Place, Dean's List"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Issuer</FormLabel>
              <TextField
                value={currentHonor.issuer}
                onChange={(e) => setCurrentHonor({ ...currentHonor, issuer: e.target.value })}
                variant="outlined"
                placeholder="e.g., School Name, Organization Name"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Grade Received</FormLabel>
              <TextField
                select
                value={currentHonor.received_grade}
                onChange={(e) => setCurrentHonor({ ...currentHonor, received_grade: e.target.value })}
                variant="outlined"
              >
                {GRADES.map((grade) => (
                  <MenuItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Level</FormLabel>
              <TextField
                select
                value={currentHonor.level}
                onChange={(e) => setCurrentHonor({ ...currentHonor, level: e.target.value })}
                variant="outlined"
              >
                {HONOR_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHonorDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleHonorSubmit}
            variant="contained"
            disabled={saving || !currentHonor.honor_title || !currentHonor.issuer}
          >
            {saving ? 'Adding...' : 'Add Honor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 