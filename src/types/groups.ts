export interface GroupPrompt {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}

export interface Group {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    prompts?: GroupPrompt[];
}