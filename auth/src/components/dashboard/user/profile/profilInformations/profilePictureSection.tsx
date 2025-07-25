'use client';

import React from 'react';
import ProfilePictureUpload from '@/src/components/design/profile/ProfilePictureUpload';

interface ProfilePictureSectionProps {
  profileID: string;
  profilePictureUrl?: string;
  onPictureUpdate: (url: string) => void;
  onPictureDelete: () => void;
  onNotification: (type: 'success' | 'error' | 'info', message: string, description?: string) => void;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  profileID,
  profilePictureUrl,
  onPictureUpdate,
  onPictureDelete,
  onNotification,
}) => {
  return (
    <ProfilePictureUpload
      profileID={profileID}
      currentPictureUrl={profilePictureUrl}
      onPictureUpdate={onPictureUpdate}
      onPictureDelete={onPictureDelete}
      onNotification={onNotification}
    />
  );
};

export default ProfilePictureSection; 