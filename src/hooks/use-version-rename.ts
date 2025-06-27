import { useState, useCallback } from 'react';
import { PromptContent } from '@/types/prompts';
import { promptsStore } from '@/store/prompts-store';

export const useVersionRename = () => {
    const { updatePrompt } = promptsStore();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [versionToRename, setVersionToRename] = useState<PromptContent | null>(null);
    const [newVersionName, setNewVersionName] = useState('');
    const [renameError, setRenameError] = useState('');

    const handleRenameVersion = useCallback((version: PromptContent) => {
        setVersionToRename(version);
        setNewVersionName(version.name || '');
        setRenameError('');
        setIsRenameDialogOpen(true);
    }, []);

    const handleConfirmRename = useCallback((selectedPrompt: any) => {
        if (!selectedPrompt || !versionToRename || !newVersionName.trim()) {
            setRenameError('Version name is required');
            return false;
        }

        const updatedVersions = selectedPrompt.versions.map((v: PromptContent) => 
            v.date === versionToRename.date 
                ? { ...v, name: newVersionName.trim() } 
                : v
        );

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            versions: updatedVersions,
            updatedAt: new Date().toISOString()
        });

        setNewVersionName('');
        setVersionToRename(null);
        setIsRenameDialogOpen(false);
        return true;
    }, [versionToRename, newVersionName, updatePrompt]);

    const closeRenameDialog = useCallback(() => {
        setIsRenameDialogOpen(false);
        setVersionToRename(null);
        setNewVersionName('');
        setRenameError('');
    }, []);

    return {
        isRenameDialogOpen,
        versionToRename,
        newVersionName,
        renameError,
        setNewVersionName,
        handleRenameVersion,
        handleConfirmRename,
        closeRenameDialog,
    };
};
