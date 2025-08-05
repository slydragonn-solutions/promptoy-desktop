import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

interface FilterSettings {
    sortBy: "a-z" | "z-a" | "newest" | "oldest";
}

interface EditorSettings {
    fontSize: 12 | 13 | 14 | 15 | 16;
    showToolbar: boolean;
    minimap: boolean;
}

interface ListSettings {
    numberOfRecentPrompts: 3 | 5 | 10;
    listOpenOnStart: "none" | "all" | "groups" | "ungrouped";
}

export interface Settings {
    filter: FilterSettings;
    editor: EditorSettings;
    list: ListSettings;
    theme: "light" | "dark";
}

const defaultSettings: Settings = {
    filter: {
        sortBy: "newest",
    },
    editor: {
        fontSize: 14,
        showToolbar: true,
        minimap: true,
    },
    list: {
        numberOfRecentPrompts: 3,
        listOpenOnStart: "all",
    },
    theme: "light",
};

type SettingsStore = Settings & {
    updateFilter: (filter: Partial<FilterSettings>) => void;
    updateEditor: (editor: Partial<EditorSettings>) => void;
    updateList: (list: Partial<ListSettings>) => void;
    setTheme: (theme: "light" | "dark") => void;
    resetToDefault: () => void;
};

// Create a custom storage object that handles localStorage
const createPersistentStorage = (): StateStorage => {
    return {
        getItem: (name: string) => {
            try {
                return localStorage.getItem(name);
            } catch (error) {
                console.error('Error accessing localStorage:', error);
                return null;
            }
        },
        setItem: (name: string, value: string) => {
            try {
                localStorage.setItem(name, value);
            } catch (error) {
                console.error('Error writing to localStorage:', error);
            }
        },
        removeItem: (name: string) => {
            try {
                localStorage.removeItem(name);
            } catch (error) {
                console.error('Error removing from localStorage:', error);
            }
        },
    };
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            ...defaultSettings,
            updateFilter: (filter) =>
                set((state) => ({
                    filter: { ...state.filter, ...filter },
                })),
            updateEditor: (editor) =>
                set((state) => ({
                    editor: { ...state.editor, ...editor },
                })),
            updateList: (list) =>
                set((state) => ({
                    list: { ...state.list, ...list },
                })),
            setTheme: (theme) =>
                set(() => ({
                    theme,
                })),
            resetToDefault: () => set(() => defaultSettings),
        }),
        {
            name: 'app-settings-storage', // unique name for localStorage key
            storage: createJSONStorage(createPersistentStorage),
            version: 1, // increment this when you want to reset the persisted data
        }
    )
);

// Utility function to get the current theme
export const getCurrentTheme = (): "light" | "dark" => {
    return useSettingsStore.getState().theme;
};

// Utility function to toggle between light and dark theme
export const toggleTheme = (): void => {
    const currentTheme = getCurrentTheme();
    useSettingsStore.getState().setTheme(currentTheme === 'light' ? 'dark' : 'light');
};
