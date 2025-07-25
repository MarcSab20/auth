import { create } from 'zustand';

interface ProfileStore {
  profilePictureUrl: string | null;
  setProfilePictureUrl: (url: string | null) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profilePictureUrl: null,
  setProfilePictureUrl: (url) => set({ profilePictureUrl: url }),
})); 