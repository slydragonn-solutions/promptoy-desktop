import { Prompt } from "@/types/prompts";
import { BaseDirectory, exists, mkdir, readDir, readTextFile, remove, writeTextFile } from "@tauri-apps/plugin-fs";

// Validation functions
function validatePrompt(prompt: Partial<Prompt>): { isValid: boolean; error?: string } {
  if (!prompt.id) {
    return { isValid: false, error: 'Prompt ID is required' };
  }
  if (!prompt.name || prompt.name.trim() === '') {
    return { isValid: false, error: 'Prompt name is required' };
  }
  if (!prompt.versions || !Array.isArray(prompt.versions) || prompt.versions.length === 0) {
    return { isValid: false, error: 'Prompt versions is required' };
  }
  return { isValid: true };
}

async function ensurePromptVaultExists(): Promise<void> {
  const existsPromptVault = await exists('promptoy-vault', { baseDir: BaseDirectory.AppData });
  if (!existsPromptVault) {
    await mkdir('promptoy-vault', { baseDir: BaseDirectory.AppData });
  }
}

export async function loadPrompts(): Promise<Prompt[]> {
  try {
    await ensurePromptVaultExists();
    const entries = await readDir('promptoy-vault', { baseDir: BaseDirectory.AppData });
    
    const results = await Promise.all(
      entries
        .filter(entry => entry.name.startsWith('prompt-') && entry.name.endsWith('.json'))
        .map(async (entry) => {
          try {
            const content = await readTextFile(`promptoy-vault/${entry.name}`, { 
              baseDir: BaseDirectory.AppData 
            });
            return JSON.parse(content);
          } catch (error) {
            console.error(`Error reading file ${entry.name}:`, error);
            return null;
          }
        })
    );
    
    // Filter out null values and validate prompts
    const validPrompts = results.filter((prompt): prompt is Prompt => {
      if (!prompt) return false;
      const validation = validatePrompt(prompt);
      if (!validation.isValid) {
        console.warn(`Invalid prompt format in file:`, prompt);
      }
      return validation.isValid;
    });
    
    return validPrompts;
  } catch (error) {
    console.error('Error loading prompts:', error);
    // Return empty array on error to maintain type consistency
    return [];
  }
}

export async function createPrompt(prompt: Omit<Prompt, 'createdAt' | 'updatedAt' | 'isSynced'>): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    await ensurePromptVaultExists();
    
    const now = new Date().toISOString();
    const promptWithMetadata: Prompt = {
      ...prompt,
      createdAt: now,
      updatedAt: now,
      isSynced: false
    };

    await writeTextFile(
      `promptoy-vault/prompt-${prompt.id}.json`,
      JSON.stringify(promptWithMetadata, null, 2),
      { baseDir: BaseDirectory.AppData }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error creating prompt:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create prompt' 
    };
  }
}

export async function updatePrompt(updatedPrompt: Partial<Prompt> & { id: string }): Promise<{ success: boolean; error?: string }> {
  try {
    if (!updatedPrompt.id) {
      return { success: false, error: 'Prompt ID is required for update' };
    }

    const filePath = `promptoy-vault/prompt-${updatedPrompt.id}.json`;
    const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });
    
    if (!fileExists) {
      return { success: false, error: 'Prompt not found' };
    }

    // Load existing prompt
    const content = await readTextFile(filePath, { baseDir: BaseDirectory.AppData });
    const existingPrompt = JSON.parse(content) as Prompt;
    
    // Merge updates
    const mergedPrompt: Prompt = {
      ...existingPrompt,
      ...updatedPrompt,
    };

    // Validate merged prompt
    const validation = validatePrompt(mergedPrompt);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Save updated prompt
    await writeTextFile(
      filePath,
      JSON.stringify(mergedPrompt, null, 2),
      { baseDir: BaseDirectory.AppData }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error updating prompt:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update prompt' 
    };
  }
}

export async function deletePrompt(promptId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!promptId) {
      return { success: false, error: 'Prompt ID is required' };
    }

    const filePath = `promptoy-vault/prompt-${promptId}.json`;
    const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });
    
    if (!fileExists) {
      return { success: false, error: 'Prompt not found' };
    }

    await remove(filePath, { baseDir: BaseDirectory.AppData });
    return { success: true };
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete prompt' 
    };
  }
}
