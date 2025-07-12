export interface Group {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    prompts?: string[]; // Array of prompt IDs
}