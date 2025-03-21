'use client';

import { useState, useRef } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress } from '@mui/material';

interface DocumentUploadProps {
  documentType: 'resume' | 'essay' | 'transcript' | 'recommendation_letter' | 'other';
  onProcessed: (text: string) => void;
  buttonText?: string;
}

export function DocumentUpload({ documentType, onProcessed, buttonText = 'Upload Document' }: DocumentUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/process-document`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const data = await response.json();
      setPreviewText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleSave = () => {
    if (previewText) {
      onProcessed(previewText);
      setPreviewText(null);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => fileInputRef.current?.click()}
        fullWidth
      >
        {buttonText}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.docx,.txt"
        style={{ display: 'none' }}
      />

      <Dialog open={isProcessing || !!previewText} maxWidth="md" fullWidth>
        <DialogTitle>
          {isProcessing ? 'Processing Document' : 'Preview Processed Text'}
        </DialogTitle>
        <DialogContent>
          {isProcessing ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : previewText ? (
            <Typography whiteSpace="pre-wrap">{previewText}</Typography>
          ) : null}
        </DialogContent>
        {previewText && (
          <DialogActions>
            <Button onClick={() => setPreviewText(null)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
} 