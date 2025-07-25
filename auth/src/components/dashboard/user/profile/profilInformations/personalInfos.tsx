'use client';

import React, { useState } from 'react';
import ProfileForm from './profileForm';
import AccountForm from './accountForm';
import ChangePasswordForm from './changePasswordForm';


const sections = [
  { id: 'profileInfo', name: 'Profile Information' },
  { id: 'accountInfo', name: 'Account Information' },
  { id: 'passwordChange', name: 'Change Password' },
  { id: 'emailUpdate', name: 'Change Email' },
  { id: 'logoutSessions', name: 'Logout from All Sessions' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const PersonalInfo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Mon Profile</h1>
      <p className="text-gray-600">Modifiez vos informations personnelle</p>

      <div className="mt-6 space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-md">
            <button
              className="flex justify-between w-full px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => toggleSection(section.id)}
            >
              {section.name}
              <span>{activeSection === section.id ? '-' : '+'}</span>
            </button>
            {activeSection === section.id && (
              <div className="p-4 bg-white">{renderContent(section.id)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  function renderContent(sectionId: string) {
    switch (sectionId) {
      case 'profileInfo':
        return <ProfileForm initialData={{
          profileID: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          nationality: '',
          phoneNumber: ''
        }} />;
      case 'accountInfo':
        return <AccountForm />;
      case 'passwordChange':
        return <ChangePasswordForm />;
      case 'emailUpdate':
      default:
        return null;
    }
  }
};

export default PersonalInfo;
