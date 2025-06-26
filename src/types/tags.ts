interface Prompt {
    id: string;
    name: string;
}

export interface Tag {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    prompts: Prompt[];
}