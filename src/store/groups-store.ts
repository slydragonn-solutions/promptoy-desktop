import { create } from "zustand";
import { Group } from "@/types/groups";

interface GroupsStore {
  groups: Group[];
  selectedGroupId: string | null;
  isLoading: boolean;
  error: string | null;
  loadGroups: () => void;
  addGroup: (name: string) => Group | null;
  updateGroup: (id: string, updates: Partial<Omit<Group, 'id' | 'createdAt'>>) => boolean;
  removeGroup: (id: string) => boolean;
  selectGroup: (id: string | null) => void;
  getGroupById: (id: string) => Group | undefined;
}

const STORAGE_KEY = 'promptoy-groups';

// Helper function to save groups to localStorage
const saveGroupsToStorage = (groups: Group[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups to localStorage:', error);
    throw new Error('Failed to save groups');
  }
};

export const useGroupsStore = create<GroupsStore>((set, get) => ({
  groups: [],
  selectedGroupId: null,
  isLoading: false,
  error: null,

  loadGroups: () => {
    try {
      set({ isLoading: true });
      const savedGroups = localStorage.getItem(STORAGE_KEY);
      if (savedGroups) {
        set({ groups: JSON.parse(savedGroups) });
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      set({ error: 'Failed to load groups' });
    } finally {
      set({ isLoading: false });
    }
  },

  addGroup: (name) => {
    try {
      const trimmedName = name.trim();
      if (!trimmedName) return null;

      // Check if group with same name already exists (case insensitive)
      const existingGroup = get().groups.find(
        group => group.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingGroup) return existingGroup;

      const newGroup: Group = {
        id: crypto.randomUUID(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => {
        const updatedGroups = [...state.groups, newGroup];
        saveGroupsToStorage(updatedGroups);
        return { groups: updatedGroups };
      });

      return newGroup;
    } catch (error) {
      console.error('Error adding group:', error);
      set({ error: 'Failed to add group' });
      return null;
    }
  },

  updateGroup: (id, updates) => {
    try {
      set((state) => {
        const updatedGroups = state.groups.map((group) =>
          group.id === id 
            ? { 
                ...group, 
                ...updates,
                updatedAt: new Date().toISOString() 
              } 
            : group
        );
        saveGroupsToStorage(updatedGroups);
        return { groups: updatedGroups };
      });
      return true;
    } catch (error) {
      console.error('Error updating group:', error);
      set({ error: 'Failed to update group' });
      return false;
    }
  },

  removeGroup: (id) => {
    try {
      set((state) => {
        const updatedGroups = state.groups.filter(group => group.id !== id);
        saveGroupsToStorage(updatedGroups);
        
        // Clear selection if the removed group was selected
        const newSelectedGroupId = state.selectedGroupId === id ? null : state.selectedGroupId;
        
        return { 
          groups: updatedGroups,
          selectedGroupId: newSelectedGroupId
        };
      });
      return true;
    } catch (error) {
      console.error('Error removing group:', error);
      set({ error: 'Failed to remove group' });
      return false;
    }
  },

  selectGroup: (id) => {
    set({ selectedGroupId: id });
  },

  getGroupById: (id) => {
    return get().groups.find(group => group.id === id);
  }
}));
