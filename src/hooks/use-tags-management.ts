import { TagColorScheme, TagPrompt } from "@/types/tags";
import { useEffect, useState } from "react";
import { useTagsStore } from "@/store/tags-store";
import { toast } from "sonner";

export default function useTagsManagement(tagsId: string[], onChange: (tagsId: string[]) => void) {
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<TagColorScheme | null>(null);
    const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
    const [editedTagName, setEditedTagName] = useState<string>('');

    const { tags, addTag, updateTag, removeTag, loadTags, getTagById } = useTagsStore();

    useEffect(() => {
        loadTags();
    }, []);

    const createTag = async ( tagPrompt: TagPrompt | undefined = undefined ) => {
        const tagName = newTagName.trim();
        if (!tagName) return;
        
        if (tagName.length > 25) {
          toast.error('Tag name must be 25 characters or less');
          return;
        }
    
        try {
          // First check if tag with same name already exists in the current tags
          const existingTag = tags.find(tag => 
            tag.name.toLowerCase() === tagName.toLowerCase()
          );
          
          if (existingTag) {
            // If tag exists, add it if not already in the value array
            if (!tagsId.includes(existingTag.id)) {
              if (tagPrompt) {
                updateTag(existingTag.id, { prompts: [...(existingTag.prompts || []), tagPrompt] });
              } else {
                updateTag(existingTag.id, { prompts: [...(existingTag.prompts || [])] });
              }
              onChange([...tagsId, existingTag.id]);
            }
          } else {
            
            // Add the tag to the store
            const newTag = addTag(tagName, tagPrompt || undefined);
              
            if (newTag) {
              onChange([...tagsId, newTag.id]);
              toast.success(`Tag "${tagName}" created`);
            } else {
              throw new Error('Failed to create tag');
            }
          }
          
          // Clear input fields only if everything was successful
          setNewTagName('');
        } catch (error: unknown) {
          console.error('Error in handleCreateTag:', error);
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          toast.error(`Error: ${errorMessage}`);
        }
      };
    
      const startEdit = (tagId: string, currentName: string, currentColor: TagColorScheme) => {
        setEditingTagId(tagId);
        setEditedTagName(currentName);
        setSelectedColor(currentColor);
      };
    
      const cancelEdit = () => {
        setEditingTagId(null);
        setEditedTagName('');
        setSelectedColor(null);
      };
    
      const saveEdit = () => {
        if (!editingTagId || !editedTagName.trim()) return;
        
        const trimmedName = editedTagName.trim();
        if (trimmedName.length > 25) {
          toast.error('Tag name must be 25 characters or less');
          return;
        }
    
        try {
          const success = updateTag(editingTagId, {
            name: trimmedName,
            color: selectedColor || getTagById(editingTagId)?.color 
          });
          
          if (success) {
            toast.success('Tag updated successfully');
          } else {
            throw new Error('Failed to update tag');
          }
        } catch (error) {
          console.error('Error updating tag:', error);
          toast.error('Failed to update tag');
        } finally {
          cancelEdit();
        }
      };
    
      const removeTagFromPrompt = (e: React.MouseEvent, tagId: string, promptId: string) => {
        e.stopPropagation();
        const tag = getTagById(tagId);
        const newTags = (tagsId || []).filter(id => id !== tagId);
        updateTag(tagId, { prompts: tag?.prompts?.filter(prompt => prompt.id !== promptId) || [] });
        onChange(newTags);  
      };
    
      const deleteTag = async () => {
        if (!deletingTagId) return;
        
        try {
          const success = await removeTag(deletingTagId);
          if (success) {
            // Remove the tag from the current selection if it's selected
            const newTags = (tagsId || []).filter(id => id !== deletingTagId);
            if (newTags.length !== (tagsId || []).length) {
              onChange(newTags);
            }
            // Close the edit form if the deleted tag was being edited
            if (editingTagId === deletingTagId) {
              setEditingTagId(null);
              setEditedTagName('');
              setSelectedColor(null);
            }
            toast.success('Tag deleted successfully');
          } else {
            throw new Error('Failed to delete tag');
          }
        } catch (error) {
          console.error('Error deleting tag:', error);
          toast.error('Failed to delete tag');
        } finally {
          setDeletingTagId(null);
        }
      };
      

      return {
        editingTagId,
        newTagName,
        selectedColor,
        deletingTagId,
        editedTagName,
        createTag,
        startEdit,
        cancelEdit,
        saveEdit,
        removeTagFromPrompt,
        deleteTag,
        setNewTagName,
        setEditingTagId,
        setEditedTagName,
        setSelectedColor,
        setDeletingTagId,
      };
}