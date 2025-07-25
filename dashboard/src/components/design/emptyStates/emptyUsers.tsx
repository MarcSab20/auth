'use client';

import React from 'react';
import { UserGroupIcon } from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/20/solid'

interface EmptyTeamsProps {
  /** 
   * 'advanced' = dans l’onglet Équipes, on propose un bouton d’invitation  
   * 'dashboard' = dans le tableau de bord user, on oriente vers l’onglet Équipes
   */
  variant?: 'advanced' | 'dashboard';
  /** action à lancer pour inviter (modal, etc.) */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyTeams({
  variant = 'dashboard',
  action,
}: EmptyTeamsProps) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="text-center space-y-4">
        <UserGroupIcon
          className="mx-auto h-16 w-16 text-gray-300 opacity-40"
          aria-hidden="true"
        />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          Aucun membre dans l’équipe 
        </h3>

        {variant === 'advanced' ? (
          <>
            <p className="text-sm text-gray-500">
              Commencez par inviter des membres à rejoindre votre organisation.
            </p>
            {action && (
              <button
                onClick={action.onClick}
                className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-grey focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                                <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />

                {action.label}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Pour ajouter des membres, rendez‑vous dans l’onglet « Équipes ».
          </p>
        )}
      </div>
    </div>
  );
}
