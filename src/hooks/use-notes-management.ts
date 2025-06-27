import { useCallback, useRef, useEffect, useState } from 'react';
import { promptsStore } from '@/store/prompts-store';

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

        const newNoteObj = {
            content: newNote.trim(),
            date: new Date().toISOString(),
        };

        const updatedNotes = [
            ...(selectedPrompt.notes || []),
            newNoteObj
        ];

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            notes: updatedNotes,
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
