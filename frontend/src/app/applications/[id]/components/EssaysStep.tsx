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
  IconButton,
  Typography,
  Paper,
  styled,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Application } from '@/types/application';
import { useSupabase } from '@/app/supabase-provider';
import { DocumentUpload } from './DocumentUpload';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

interface EssaysStepProps {
  application: Application;
  onSave: (data: Partial<Application>) => Promise<void>;
}

const MIN_WORDS = 250;
const MAX_WORDS = 650;

interface Essay {
  id?: string;
  prompt: string;
  response: string;
  word_count: number;
}

const getWordCountMessage = (wordCount: number): { message: string; color: string } => {
  if (wordCount < MIN_WORDS) {
    const wordsNeeded = MIN_WORDS - wordCount;
    return {
      message: `Add ${wordsNeeded} more word${wordsNeeded === 1 ? '' : 's'} to meet the ${MIN_WORDS} word minimum.`,
      color: 'error.main'
    };
  } else if (wordCount > MAX_WORDS) {
    const wordsToRemove = wordCount - MAX_WORDS;
    return {
      message: `Remove ${wordsToRemove} word${wordsToRemove === 1 ? '' : 's'} to meet the ${MAX_WORDS} word maximum.`,
      color: 'error.main'
    };
  }
  return {
    message: `Word count: ${wordCount} (${MIN_WORDS}-${MAX_WORDS} words required)`,
    color: 'success.main'
  };
};

export function EssaysStep({ application, onSave }: EssaysStepProps) {
  const { supabase } = useSupabase();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEssay, setCurrentEssay] = useState<Essay>({
    prompt: '',
    response: '',
    word_count: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadEssays = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .eq('application_id', application.id)
        .order('created_at');

      if (error) throw error;
      setEssays(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading essays:', err);
      setError('Failed to load essays');
    } finally {
      setLoading(false);
    }
  }, [supabase, application.id]);

  useEffect(() => {
    loadEssays();
  }, [loadEssays]);

  const handleSubmit = async () => {
    try {
      // Validate word count
      if (currentEssay.word_count < MIN_WORDS || currentEssay.word_count > MAX_WORDS) {
        throw new Error(`Essays must be between ${MIN_WORDS} and ${MAX_WORDS} words.`);
      }

      setSaving(true);
      const { error } = await supabase
        .from('essays')
        .insert({
          ...currentEssay,
          application_id: application.id,
        });

      if (error) throw error;

      await loadEssays();
      await onSave({ status: 'in_progress' });
      setDialogOpen(false);
      setCurrentEssay({
        prompt: '',
        response: '',
        word_count: 0,
      });
    } catch (err) {
      console.error('Error adding essay:', err);
      setError(err instanceof Error ? err.message : 'Failed to add essay');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('essays')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadEssays();
      await onSave({ status: 'in_progress' });
    } catch (err) {
      console.error('Error deleting essay:', err);
      setError('Failed to delete essay');
    } finally {
      setSaving(false);
    }
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleResponseChange = (text: string) => {
    setCurrentEssay({
      ...currentEssay,
      response: text,
      word_count: calculateWordCount(text),
    });
  };

  const handleProcessedDocument = (text: string) => {
    handleResponseChange(text);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Essays</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={saving}
          >
            Add Essay
          </Button>
        </Box>

        {essays.map((essay) => (
          <Box
            key={essay.id}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, pr: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {essay.prompt}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {essay.response}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1, 
                    display: 'block',
                    color: getWordCountMessage(essay.word_count).color
                  }}
                >
                  {getWordCountMessage(essay.word_count).message}
                </Typography>
              </Box>
              <IconButton
                onClick={() => essay.id && handleDelete(essay.id)}
                disabled={saving}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </StyledPaper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Essay</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Essay Prompt</FormLabel>
              <TextField
                value={currentEssay.prompt}
                onChange={(e) => setCurrentEssay({ ...currentEssay, prompt: e.target.value })}
                multiline
                rows={2}
                placeholder="Enter your essay prompt here"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Essay Response</FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DocumentUpload
                  documentType="essay"
                  onProcessed={handleProcessedDocument}
                  buttonText="Upload Essay"
                />
                <TextField
                  value={currentEssay.response}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  multiline
                  rows={12}
                  fullWidth
                  placeholder="Write or paste your essay here"
                />
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1,
                  color: getWordCountMessage(currentEssay.word_count).color
                }}
              >
                {getWordCountMessage(currentEssay.word_count).message}
              </Typography>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !currentEssay.prompt || !currentEssay.response}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 