import { create } from "zustand";
import { Prompt } from "@/types/prompts";
import { createPrompt, updatePrompt as updatePromptFromFs, deletePrompt, loadPrompts as loadPromptsFromFs } from "@/lib/fs";

interface PromptsStore {
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    isLoading: boolean;
    error: string | null;
    // Load all prompts from filesystem
    getPrompts: () => Promise<boolean>;
    // CRUD Operations
    addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>) => Promise<boolean>;
    updatePrompt: (id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>) => Promise<boolean>;
    removePrompt: (id: string) => Promise<boolean>;
    // Selection
    setSelectedPrompt: (promptId: string | null) => boolean;
    // Utils
    clearError: () => void;
}

export const promptsStore = create<PromptsStore>((set, get) => ({
    prompts: [],
    selectedPrompt: null,
    isLoading: false,
    error: null,
    
    // Load all prompts from the filesystem
    getPrompts: async () => {
        set({ isLoading: true, error: null });
        try {
            const prompts = await loadPromptsFromFs();
            set({ prompts, isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load prompts';
            set({ 
                error: errorMessage,
                isLoading: false 
            });
            console.error('Error loading prompts:', error);
            return false;
        }
    },
    


    updatePrompt: async (id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>) => {
        set({ isLoading: true, error: null });
        try {
            const { success, error } = await updatePromptFromFs({ id, ...updates });
            
            if (success) {
                set((state) => ({
                    prompts: state.prompts.map((prompt) =>
                        prompt.id === id ? { ...prompt, ...updates } : prompt
                    ),
                    selectedPrompt: state.selectedPrompt?.id === id 
                        ? { ...state.selectedPrompt, ...updates }
                        : state.selectedPrompt,
                    isLoading: false
                }));
                return true;
            } else {
                set({ error: error || 'Failed to update prompt', isLoading: false });
                return false;
            }
        } catch (error) {
            console.error('Error updating prompt:', error);
            set({ 
                error: error instanceof Error ? error.message : 'An unexpected error occurred', 
                isLoading: false 
            });
            return false;
        }
    },

    removePrompt: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { success, error } = await deletePrompt(id);
            
            if (success) {
                set((state) => ({
                    prompts: state.prompts.filter((prompt) => prompt.id !== id),
                    selectedPrompt: state.selectedPrompt?.id === id ? null : state.selectedPrompt,
                    isLoading: false
                }));
                return true;
            } else {
                set({ error: error || 'Failed to delete prompt', isLoading: false });
                return false;
            }
        } catch (error) {
            console.error('Error deleting prompt:', error);
            set({ 
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
                isLoading: false 
            });
            return false;
        }
    },

    // Add a new prompt to the store and filesystem
    addPrompt: async (newPrompt) => {
        set({ isLoading: true, error: null });
        
        try {
            // Generate a unique ID for the new prompt
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            
            // Create the complete prompt object
            const prompt: Prompt = {
                ...newPrompt,
                id,
                createdAt: now,
                updatedAt: now,
                isSynced: false,
                // Ensure optional arrays are initialized
                versions: newPrompt.versions || [],
                notes: newPrompt.notes || [],
                chatHistory: newPrompt.chatHistory || [],
                tags: newPrompt.tags || [],
                isFavorite: newPrompt.isFavorite || false,
                group: newPrompt.group || undefined
            };

            // Save to filesystem
            const { success, error } = await createPrompt(prompt);
            
            if (!success) {
                throw new Error(error || 'Failed to save prompt to filesystem');
            }

            // Update store state
            set(state => ({
                prompts: [prompt, ...state.prompts],
                selectedPrompt: prompt,
                isLoading: false
            }));

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add prompt';
            set({ 
                error: errorMessage,
                isLoading: false 
            });
            console.error('Error adding prompt:', error);
            return false;
        }
    },

    // Set the currently selected prompt
    setSelectedPrompt: (promptId) => {
        try {
            // Allow clearing the selection
            if (promptId === null) {
                set({ selectedPrompt: null });
                return true;
            }

            // Validate the prompt object
            if (!promptId || typeof promptId !== 'string') {
                throw new Error('Invalid prompt: missing or invalid ID');
            }

            // Check if the prompt exists in the store
            const promptExists = get().prompts.some(p => p.id === promptId);
            if (!promptExists) {
                throw new Error('Cannot select a prompt that is not in the store');
            }

            set({ 
                selectedPrompt: get().prompts.find(p => p.id === promptId),
                error: null
            });
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to select prompt';
            set({ error: errorMessage });
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));