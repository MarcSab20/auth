import { useEffect } from 'react';
import { useAuth } from '@/context/authenticationContext';
import { useProfileStore } from '@/src/store/profileStore';

export function useProfilePicture() {
  const { user } = useAuth();
  const { profilePictureUrl, setProfilePictureUrl } = useProfileStore();

  useEffect(() => {
    async function fetchProfilePicture() {
      if (!user?.profileID) {
        setProfilePictureUrl(null);
        return;
      }

      try {
        const response = await fetch(`/api/profile/${user.profileID}`);
        const data = await response.json();
        setProfilePictureUrl(data.profilePicture?.url || null);
      } catch (error) {
        console.error('Erreur lors de la récupération de la photo de profil:', error);
        setProfilePictureUrl(null);
      }
    }

    fetchProfilePicture();
  }, [user?.profileID, setProfilePictureUrl]);

  return profilePictureUrl;
} 