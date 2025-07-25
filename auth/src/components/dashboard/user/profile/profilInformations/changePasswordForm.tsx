'use client';

import React from 'react';
import { Button } from '@/src/components/landing-page/Button'

const ChangePasswordForm: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
      <p className="text-sm text-gray-600">Update your account password.</p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          className="inline-flex justify-center"
        >
          Change Password
        </Button>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
