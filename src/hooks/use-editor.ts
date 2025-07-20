import { useState, useRef, useCallback, useEffect } from 'react';
import { Prompt } from '@/types/prompts';
import { promptsStore } from '@/store/prompts-store';
import { toast } from 'sonner';
import { MAX_CONTENT_LENGTH } from '@/constants/prompt';

export const useEditor = (initialPrompt: Prompt | null) => {
  const { updatePrompt, removePrompt } = promptsStore();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update content when selected prompt changes
  useEffect(() => {
    if (initialPrompt) {
      setContent(initialPrompt.versions[0]?.content || '');
      setNewName(initialPrompt.name);
    }
  }, [initialPrompt]);

  const handleUpdatePrompt = useCallback(
    async (updates: Partial<Prompt>) => {
      if (!initialPrompt) return false;

      setIsSaving(true);
      try {
        const updatedPrompt = {
          ...initialPrompt,
          ...updates,
          tags: updates.tags || initialPrompt.tags || [],
          updatedAt: new Date().toISOString(),
        };

        await updatePrompt(initialPrompt.id, updatedPrompt);
        return true;
      } catch (error) {
        console.error('Error updating prompt:', error);
        toast.error('Failed to update prompt');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [initialPrompt, updatePrompt]
  );

  const saveContent = useCallback(
    async (value: string) => {
      if (!initialPrompt) return;

      try {
        const now = new Date().toISOString();
        const currentVersion = initialPrompt.versions[0];

        await updatePrompt(initialPrompt.id, {
          ...initialPrompt,
          versions: [
            {
              ...(currentVersion || { name: 'Untitled' }),
              content: value,
              date: now,
            },
            ...initialPrompt.versions.slice(1),
          ],
          updatedAt: now,
        });
      } catch (error) {
        console.error('Error saving prompt:', error);
        toast.error('Failed to save prompt');
      } finally {
        setIsSaving(false);
      }
    },
    [initialPrompt, updatePrompt]
  );

  const handleRename = useCallback(async () => {
    if (!initialPrompt || !newName.trim()) return;

    const trimmedName = newName.trim();
    if (trimmedName.length > 50) {
      toast.error('Prompt name cannot exceed 50 characters');
      return;
    }

    const success = await handleUpdatePrompt({ name: trimmedName });
    if (success) {
      setIsRenameDialogOpen(false);
      setNewName('');
    }
  }, [initialPrompt, newName, handleUpdatePrompt]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      toast.success('Prompt content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard');
    }
  }, [content]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRename();
      } else if (e.key === 'Escape') {
        setIsRenameDialogOpen(false);
        setNewName('');
      }
    },
    [handleRename]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        if (value.length <= MAX_CONTENT_LENGTH) {
          setIsSaving(true);
          setContent(value);
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          saveTimeoutRef.current = setTimeout(() => {
            saveContent(value || '');
          }, 1000);
        } else {
          // Show warning if user is trying to exceed the limit
          toast.error(`Content cannot exceed the limit of ${MAX_CONTENT_LENGTH.toLocaleString()} characters. Content won't be saved.`);
          // Truncate the content to the maximum allowed length
          /*
          const truncated = value.substring(0, MAX_CONTENT_LENGTH);
          setContent(truncated);
          // Force save the truncated content
          saveContent(truncated);
          */
        }
      }
    },
    [saveContent]
  );

  const handleDeletePrompt = useCallback(async () => {
    if (!initialPrompt) return;

    try {
      await removePrompt(initialPrompt.id);
      toast.success('Prompt deleted successfully');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  }, [initialPrompt, removePrompt]);

  return {
    content,
    isSaving,
    isRenameDialogOpen,
    newName,
    editorRef,
    setNewName,
    setIsRenameDialogOpen,
    handleEditorChange,
    handleEditorDidMount: (editor: any, _monaco: any) => {
      editorRef.current = editor;
    },
    handleUpdatePrompt,
    handleRename,
    handleKeyDown,
    handleCopyToClipboard,
    handleDeletePrompt,
  };
};
