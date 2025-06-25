import { Prompt } from "@/store/prompts-store";
import { BaseDirectory, exists, mkdir, readDir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export async function loadPrompts(): Promise<Prompt[]> {
    try {
        const existsPromptVault = await exists('promptoy-vault', { baseDir: BaseDirectory.Document });
    
        if (!existsPromptVault) {
            await mkdir('promptoy-vault', { baseDir: BaseDirectory.Document });
            return [];
        }

        const entries = await readDir('promptoy-vault', { baseDir: BaseDirectory.Document });
        const result = await Promise.all(entries.map(async (entry) => {
            const content = await readTextFile(`promptoy-vault/${entry.name}`, { baseDir: BaseDirectory.Document });
            const prompt = JSON.parse(content);
            return prompt;
        }));
        
        return result;

    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function createPrompt(prompt: Prompt): Promise<void> {
    try {
        await writeTextFile(`promptoy-vault/${prompt.name}.json`, JSON.stringify(prompt), { baseDir: BaseDirectory.Document });
    } catch (error) {
        console.error(error);
    }
}
