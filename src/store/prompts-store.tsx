import { create } from "zustand";

interface PromptContent {
    date: string;
    content: string;
}

interface PromptNote {
    date: string;
    content: string;
}

interface PromptChatHistory {
    date: string;
    content: string;
}

export interface Prompt {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    content: PromptContent[];   
    notes: PromptNote[];
    chatHistory: PromptChatHistory[];
    tags: string[];
    isFavorite: boolean;
    isSynced: boolean;
}

interface PromptsStore {
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    addPrompts: (prompts: Prompt[]) => void;
    setSelectedPrompt: (prompt: Prompt | null) => void;
}

export const promptsStore = create<PromptsStore>((set) => ({
    prompts: [],
    selectedPrompt: null,
    addPrompts: (prompts: Prompt[]) => set((state) => {
        const existingIds = new Set(state.prompts.map(p => p.id));
        const newPrompts = prompts.filter(p => !existingIds.has(p.id));
        return { prompts: [...state.prompts, ...newPrompts] };
    }),
    setSelectedPrompt: (prompt: Prompt | null) => set((state) => ({ selectedPrompt: prompt })),
}))