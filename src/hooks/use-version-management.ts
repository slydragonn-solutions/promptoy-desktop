import { useCallback, useState } from 'react';
import { PromptContent } from '@/types/prompts';
import { promptsStore } from '@/store/prompts-store';

export const useVersionManagement = () => {
    const { updatePrompt } = promptsStore();
    const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
    const [newVersionName, setNewVersionName] = useState('');
    const [versionError, setVersionError] = useState('');

    const handleOpenVersionDialog = useCallback(() => {
        setNewVersionName('');
        setVersionError('');
        setIsVersionDialogOpen(true);
    }, []);

    const handleCreateVersion = useCallback((selectedPrompt: any) => {
        if (!newVersionName.trim()) {
            setVersionError('Version name is required');
            return;
        }

        const newVersion: PromptContent = {
            name: newVersionName.trim(),
            content: selectedPrompt.versions[0].content,
            date: new Date().toISOString(),
        };

        const updatedVersions = [newVersion, ...selectedPrompt.versions];

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            versions: updatedVersions,
            updatedAt: new Date().toISOString(),
        });

        setNewVersionName('');
        setVersionError('');
        setIsVersionDialogOpen(false);
    }, [newVersionName, updatePrompt]);

    const handleDeleteVersion = useCallback((selectedPrompt: any, version: PromptContent) => {
        if (!selectedPrompt) return false;

        // Don't allow deleting the last version
        if (selectedPrompt.versions.length <= 1) {
            alert('Cannot delete the only version');
            return false;
        }

        const versionName = version.name || 'Untitled';
        const confirmMessage = `Are you sure you want to delete version "${versionName}"?\nThis action cannot be undone.`;
        
        if (!window.confirm(confirmMessage)) {
            return false;
        }

        const updatedVersions = selectedPrompt.versions.filter(
            (v: PromptContent) => v.date !== version.date
        );

        // If we're deleting the active version, make the first remaining version active
        const wasActive = selectedPrompt.versions[0].date === version.date;
        const newVersions = wasActive 
            ? [updatedVersions[0], ...updatedVersions.slice(1)] 
            : updatedVersions;

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            versions: newVersions,
            updatedAt: new Date().toISOString(),
        });

        return true;
    }, [updatePrompt]);

    const handleSelectVersion = useCallback((selectedPrompt: any, version: PromptContent) => {
        if (!selectedPrompt) return;

        // If the selected version is already the active one, do nothing
        if (selectedPrompt.versions[0]?.date === version.date) {
            return;
        }

        // Create a new versions array with the selected version moved to the top
        const otherVersions = selectedPrompt.versions.filter(
            (v: PromptContent) => v.date !== version.date
        );
        const updatedVersions = [version, ...otherVersions];

        updatePrompt(selectedPrompt.id, {
            ...selectedPrompt,
            versions: updatedVersions,
        });
    }, [updatePrompt]);

    return {
        isVersionDialogOpen,
        newVersionName,
        versionError,
        setNewVersionName,
        setVersionError,
        setIsVersionDialogOpen,
        handleOpenVersionDialog,
        handleCreateVersion,
        handleDeleteVersion,
        handleSelectVersion,
    };
};
