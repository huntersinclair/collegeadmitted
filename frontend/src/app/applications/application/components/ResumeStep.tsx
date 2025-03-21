'use client';

import { Box, Typography, styled, Button, TextField } from '@mui/material';
import { Application } from '@/types/application';
import { DocumentUpload } from './DocumentUpload';
import { useSupabase } from '@/app/supabase-provider';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Styled components for markdown
const MarkdownContainer = styled(Box)(({ theme }) => ({
  '& h1': {
    ...theme.typography.h4,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  '& h2': {
    ...theme.typography.h5,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  '& h3': {
    ...theme.typography.h6,
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
  '& p': {
    ...theme.typography.body1,
    marginBottom: theme.spacing(1.5),
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    ...theme.typography.body1,
    marginBottom: theme.spacing(0.5),
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.grey[300]}`,
    margin: theme.spacing(2, 0),
    padding: theme.spacing(0, 2),
    color: theme.palette.text.secondary,
  },
  '& hr': {
    border: 'none',
    height: '1px',
    backgroundColor: theme.palette.divider,
    margin: theme.spacing(3, 0),
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
  },
  '& th': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: theme.typography.fontWeightBold,
  },
}));

interface ResumeStepProps {
  application: Application;
  onSave: (data: Partial<Application>) => Promise<void>;
}

interface ResumeDocument {
  id: string;
  content: string;
  word_count: number;
  created_at: string;
}

export function ResumeStep({ application, onSave }: ResumeStepProps) {
  const { supabase } = useSupabase();
  const [resumeDocument, setResumeDocument] = useState<ResumeDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const loadResumeDocument = async () => {
      try {
        const { data, error } = await supabase
          .from('application_documents')
          .select('*')
          .eq('application_id', application.id)
          .eq('document_type', 'resume')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setResumeDocument(data);
        if (data) {
          setEditedContent(data.content);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading resume:', err);
        setError('Failed to load resume');
      }
    };

    loadResumeDocument();
  }, [application.id, supabase]);

  const handleProcessed = async (text: string) => {
    try {
      const { data, error } = await supabase
        .from('application_documents')
        .insert({
          application_id: application.id,
          document_type: 'resume',
          content: text,
          word_count: text.split(/\s+/).length,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setResumeDocument(data);
      setEditedContent(data.content);
      setError(null);

      // Update application status
      await onSave({
        status: 'in_progress',
        resume_text: text
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      setError('Failed to save resume');
    }
  };

  const handleSaveEdit = async () => {
    if (!resumeDocument) return;

    try {
      const { data, error } = await supabase
        .from('application_documents')
        .insert({
          application_id: application.id,
          document_type: 'resume',
          content: editedContent,
          word_count: editedContent.split(/\s+/).length,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setResumeDocument(data);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error saving edited resume:', error);
      setError('Failed to save resume changes');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Upload your resume in PDF, Word, or text format. We&apos;ll process it and extract the text for your application.
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        <DocumentUpload
          documentType="resume"
          onProcessed={handleProcessed}
          buttonText={resumeDocument ? "Replace Resume" : "Upload Resume"}
        />
      </Box>

      {resumeDocument && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Current Resume Text
            </Typography>
            <Button
              variant="outlined"
              startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
              onClick={isEditing ? handleSaveEdit : handleEdit}
              size="small"
            >
              {isEditing ? 'Save Changes' : 'Edit Text'}
            </Button>
          </Box>
          <Typography variant="caption" display="block" gutterBottom>
            Last updated: {new Date(resumeDocument.created_at).toLocaleString()}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Word count: {resumeDocument.word_count}
          </Typography>
          <Box
            sx={{
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {isEditing ? (
              <TextField
                multiline
                fullWidth
                minRows={10}
                maxRows={20}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'white',
                  },
                }}
              />
            ) : (
              <MarkdownContainer>
                <ReactMarkdown>{resumeDocument.content}</ReactMarkdown>
              </MarkdownContainer>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
} 