import { useState } from 'react';
import { useAuth, SMPUser } from '@/context/authenticationContext';
import { Avatar } from '@/src/components/catalyst/components/avatar';
import { useProfilePicture } from '@/src/hooks/useProfilePicture';

export function ProfilePictureSection({ profile }: { profile: SMPUser }) {
  const profilePictureUrl = useProfilePicture();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityID', profile.profileID);
      formData.append('entityType', 'profile');

      const response = await fetch('/api/upload/images/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de l\'image');
      }

      setSuccess('Photo de profil mise à jour avec succès');
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <Avatar
          src={profilePictureUrl || '/images/icons/nopp.png'}
          className="size-32 mb-4"
          square
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">{success}</div>
      )}

      {isUploading && (
        <div className="text-gray-500 text-sm">Téléchargement en cours...</div>
      )}
    </div>
  );
} 