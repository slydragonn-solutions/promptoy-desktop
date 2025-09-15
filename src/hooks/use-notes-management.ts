import { useCallback, useRef, useEffect, useState } from 'react';
import { promptsStore } from '@/store/prompts-store';
import { toast } from 'sonner';

export const useNotesManagement = () => {
    const { updatePrompt } = promptsStore();
    const [newNote, setNewNote] = useState('');
    const notesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [scrollToBottom]);

    const handleAddNote = useCallback((selectedPrompt: any) => {
        if (!newNote.trim() || !selectedPrompt) return;

        // Validate note length
        if (newNote.length > 500) {
            toast.error('Note is too long. Maximum 500 characters allowed.');
            return;
        }

        const currentNotes = selectedPrompt.notes || [];

        const newNoteObj = {
            content: newNote.trim(),
            date: new Date().toISOString(),
        };

        const updatedNotes = [
            ...currentNotes,
            newNoteObj
        ];

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            notes: updatedNotes,
            updatedAt: new Date().toISOString(),
        });

        setNewNote('');
        setTimeout(scrollToBottom, 100);
    }, [newNote, updatePrompt, scrollToBottom]);

    const handleDeleteNote = useCallback((selectedPrompt: any, noteDate: string) => {
        if (!selectedPrompt?.notes) return;

        const updatedNotes = selectedPrompt.notes.filter(
            (note: any) => note.date !== noteDate
        );

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            notes: updatedNotes,
            updatedAt: new Date().toISOString(),
        });
    }, [updatePrompt]);

    return {
        newNote,
        setNewNote,
        notesEndRef,
        handleAddNote,
        handleDeleteNote,
    };
};
