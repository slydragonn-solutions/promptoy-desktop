import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useGroupsStore } from '@/store/groups-store';
import { Prompt } from '@/types/prompts';

export const usePromptsGroup = (prompts: Prompt[]) => {
  const { groups, addGroup, updateGroup, removeGroup } = useGroupsStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    groupId: string | null;
  }>({ x: 0, y: 0, groupId: null });

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  // Handle creating a new group
  const handleCreateGroup = useCallback((newGroupName: string) => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      return true;
    }
    return false;
  }, [addGroup]);

  const handleContextMenu = useCallback((e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, groupId });
  }, []); 

  const handleRenameGroup = useCallback((group: { id: string; name: string }) => {
    if (!group) return;
    
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
    setContextMenu({ x: 0, y: 0, groupId: null });
    
    // Focus the input after a small delay
    setTimeout(() => {
      const input = document.querySelector(`[data-group-input="${group.id}"]`);
      if (input instanceof HTMLInputElement) {
        input.focus();
        input.select();
      }
    }, 10);
  }, []);

  const handleDeleteGroup = useCallback(async (updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<boolean>) => {
    if (!contextMenu.groupId) return false;
    
    try {
      // Check if group has prompts
      const groupPrompts = prompts.filter(p => p.group === contextMenu.groupId);
      if (groupPrompts.length > 0) {
        if (!confirm(`This group contains ${groupPrompts.length} prompt(s). All prompts will be removed from this group. Are you sure you want to proceed?`)) {
          return false;
        }
        
        // Remove group reference from all prompts in this group
        const updatePromises = groupPrompts.map(prompt => 
          updatePrompt(prompt.id, { ...prompt, group: undefined })
        );
        
        await Promise.all(updatePromises);
      }
      
      // Now it's safe to delete the group
      await removeGroup(contextMenu.groupId);
      toast.success('Group deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
      return false;
    } finally {
      setContextMenu({ x: 0, y: 0, groupId: null });
    }
  }, [prompts, removeGroup, contextMenu.groupId]);

  const handleSaveRename = useCallback((groupId: string) => {
    const trimmedName = editingGroupName.trim();
    if (trimmedName) {
      if (trimmedName.length > 50) {
        toast.error('Group name cannot exceed 50 characters');
        return false;
      }
      updateGroup(groupId, { name: trimmedName });
      setEditingGroupId(null);
      setEditingGroupName('');
      toast.success('Group renamed successfully');
      return true;
    } else {
      toast.error('Group name cannot be empty');
      return false;
    }
  }, [editingGroupName, updateGroup]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, groupId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(groupId);
    } else if (e.key === 'Escape') {
      setEditingGroupId(null);
      setEditingGroupName('');
    }
  }, [handleSaveRename]);

  return {
    groups,
    expandedGroups,
    editingGroupId,
    editingGroupName,
    contextMenu,
    setEditingGroupName,
    toggleGroup,
    handleCreateGroup,
    handleContextMenu,
    handleRenameGroup: () => {
      if (!contextMenu.groupId) return;
      const group = groups.find(g => g.id === contextMenu.groupId);
      if (group) handleRenameGroup(group);
    },
    handleDeleteGroup,
    handleSaveRename,
    handleKeyDown,
  };
};

export default usePromptsGroup;
