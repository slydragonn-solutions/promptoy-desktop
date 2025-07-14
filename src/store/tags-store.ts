import { create } from "zustand";
import { Prompt } from "@/types/prompts";
import { getRandomTagColor } from "@/constants/tags";
import { promptsStore } from "./prompts-store";
import { Tag } from "@/types/tags";


interface TagsStore {
  tags: Tag[];
  selectedTags: string[];
  isLoading: boolean;
  error: string | null;
  loadTags: () => void;
  addTag: (name: string, promptId?: string) => Tag | null;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => boolean;
  removeTag: (id: string) => boolean;
  toggleTag: (id: string) => void;
  clearSelectedTags: () => void;
  getTagById: (id: string) => Tag | undefined;
  getTagsForPrompt: (prompt: Pick<Prompt, 'tags'>) => Tag[];
  addTagToPrompt: (tagId: string, prompt: Pick<Prompt, 'tags'>) => void;
  removeTagFromPrompt: (tagId: string, prompt: Pick<Prompt, 'tags'>) => void;
}

const STORAGE_KEY = 'promptoy-tags';

// Helper function to save tags to localStorage
const saveTagsToStorage = (tags: Tag[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving tags to localStorage:', error);
    throw new Error('Failed to save tags');
  }
};

export const useTagsStore = create<TagsStore>((set, get) => ({
  tags: [],
  selectedTags: [],
  isLoading: false,
  error: null,

  loadTags: () => {
    try {
      set({ isLoading: true });
      const savedTags = localStorage.getItem(STORAGE_KEY);
      if (savedTags) {
        set({ tags: JSON.parse(savedTags) });
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      set({ error: 'Failed to load tags' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTag: (name, promptId) => {
    try {
      const trimmedName = name.trim();
      console.log('Adding tag:', trimmedName);
      if (!trimmedName) return null;

      // Check if tag with same name already exists (case insensitive)
      const existingTag = get().tags.find(
        tag => tag.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingTag) return existingTag;

      const colorScheme = getRandomTagColor();
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: trimmedName,
        color: colorScheme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prompts: promptId ? [promptId] : []
      };

      set((state) => {
        const updatedTags = [...state.tags, newTag];
        saveTagsToStorage(updatedTags);
        return { tags: updatedTags };
      });

      return newTag;
    } catch (error) {
      console.error('Error adding tag:', error);
      set({ error: 'Failed to add tag' });
      return null;
    }
  },

  updateTag: (id, updates) => {
    try {
      set((state) => {
        const updatedTags = state.tags.map((tag) =>
          tag.id === id 
            ? { 
                ...tag, 
                ...updates, 
                name: updates.name ? updates.name.trim() : tag.name,
                updatedAt: new Date().toISOString() 
              } 
            : tag
        );
        saveTagsToStorage(updatedTags);
        return { tags: updatedTags };
      });
      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      set({ error: 'Failed to update tag' });
      return false;
    }
  },

  removeTag: (id: string) => {
    try {
      // First get all prompts that have this tag
      const { prompts, updatePrompt } = promptsStore.getState();
      const promptsToUpdate = prompts.filter((prompt: Prompt) => 
        prompt.tags && prompt.tags.includes(id)
      );

      // Remove the tag from each prompt
      promptsToUpdate.forEach((prompt: Prompt) => {
        const updatedTags = prompt.tags?.filter((tagId: string) => tagId !== id) || [];
        updatePrompt(prompt.id, { tags: updatedTags });
      });

      // Then remove the tag from the tags store
      set((state) => {
        const updatedTags = state.tags.filter((tag) => tag.id !== id);
        saveTagsToStorage(updatedTags);
        return { 
          tags: updatedTags,
          selectedTags: state.selectedTags.filter(tagId => tagId !== id)
        };
      });
      return true;
    } catch (error) {
      console.error('Error removing tag:', error);
      set({ error: 'Failed to remove tag' });
      return false;
    }
  },

  toggleTag: (id) => {
    set((state) => ({
      selectedTags: state.selectedTags.includes(id)
        ? state.selectedTags.filter((tagId) => tagId !== id)
        : [...state.selectedTags, id],
    }));
  },

  clearSelectedTags: () => {
    set({ selectedTags: [] });
  },

  getTagById: (id) => {
    return get().tags.find((tag) => tag.id === id);
  },

  getTagsForPrompt: (prompt) => {
    if (!prompt.tags || !Array.isArray(prompt.tags)) return [];
    return get().tags.filter((tag) => prompt.tags?.includes(tag.id));
  },

  addTagToPrompt: (tagId, prompt) => {
    if (!prompt.tags) {
      prompt.tags = [];
    }
    if (!prompt.tags.includes(tagId)) {
      prompt.tags = [...prompt.tags, tagId];
    }
  },

  removeTagFromPrompt: (tagId, prompt) => {
    if (prompt.tags) {
      prompt.tags = prompt.tags.filter((id: string) => id !== tagId);
    }
  },
}));
