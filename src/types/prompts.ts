interface PromptTemplate {
    id: string;
    name: string;
}

interface PromptMetadata {
    type?: "blank" | "template" | "layout" | "human-lang";
    layout?: string;
    template?: PromptTemplate;
}

interface PromptContent {
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

interface PromptTag {
    id: string;
    name: string;
}

export interface Prompt {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    content: PromptContent[];   
    notes: PromptNote[];
    chatHistory: PromptChatHistory[];
    tags?: PromptTag[];
    isFavorite: boolean;
    isSynced: boolean;
    metadata: PromptMetadata;
}