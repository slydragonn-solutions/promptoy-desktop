export interface PromptContent {
    date: string;
    name?: string;
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
    versions: PromptContent[];   
    notes: PromptNote[];
    chatHistory: PromptChatHistory[];
    tags?: string[]; // Array of tag IDs
    isFavorite: boolean;
    isSynced: boolean;
}