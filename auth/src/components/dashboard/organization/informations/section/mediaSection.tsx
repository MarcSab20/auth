'use client';

import React from 'react';
import OrganizationLogoUpload from '@/src/components/design/organization/OrganizationLogoUpload';

interface MediaSectionProps {
  organizationID: string;
  smallLogoUrl?: string;
  smallLogoID?: string;
  onMediaUpdate: (type: 'smallLogo', url: string) => void;
  onMediaDelete: (type: 'smallLogo') => void;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  organizationID,
  smallLogoUrl,
  onMediaUpdate,
  onMediaDelete,
}) => {
  const handleNotification = (type: 'success' | 'error' | 'info', message: string, description?: string) => {
    // Vous pouvez implémenter votre propre système de notification ici
    console.log(type, message, description);
  };

  return (
    <OrganizationLogoUpload
      organizationID={organizationID}
      currentLogoUrl={smallLogoUrl}
      onLogoUpdate={(url) => onMediaUpdate('smallLogo', url)}
      onLogoDelete={() => onMediaDelete('smallLogo')}
      onNotification={handleNotification}
    />
  );
};

export default MediaSection; 