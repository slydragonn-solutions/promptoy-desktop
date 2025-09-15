import { useCallback, useState } from 'react';
import { PromptContent } from '@/types/prompts';
import { promptsStore } from '@/store/prompts-store';

export const useVersionManagement = () => {
    const { updatePrompt } = promptsStore();
    const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
    const [newVersionName, setNewVersionName] = useState('');
    const [versionError, setVersionError] = useState('');
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [versionToRename, setVersionToRename] = useState<PromptContent | null>(null);
    const [renameError, setRenameError] = useState('');

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
        if (newVersionName.length > 50) {
            setRenameError('Version name is too long. Maximum 50 characters allowed.');
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
            updatedAt: new Date().toISOString(),
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
        isVersionDialogOpen,
        isRenameDialogOpen,
        versionToRename,
        newVersionName,
        versionError,
        renameError,
        setNewVersionName,
        setVersionError,
        setIsVersionDialogOpen,
        handleOpenVersionDialog,
        handleCreateVersion,
        handleDeleteVersion,
        handleSelectVersion,
        handleRenameVersion,
        handleConfirmRename,
        closeRenameDialog,
    };
};
