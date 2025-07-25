'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/src/components/landing-page/Button";
import { Heading } from '@/src/components/catalyst/components/heading';
import { Avatar } from '@/src/components/catalyst/components/avatar';


interface User {
  userID: string;
  role: string;
  username: string;
  email: string;
  name: string;
  lastname: string;
  profilePicture?: string;
  status: string;
  title: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<User>) => void;
  onDelete?: (userID: string, email: string) => void;
  member: User;
  organizationID: string;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  member,
  organizationID,
}) => {
  const [role, setRole] = useState(member.role);
  const isOwner = member.role === "Owner";
  const isInvitation = member?.userID?.startsWith('invitation_');
  const modalRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/organization/${organizationID}/members/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: member.userID,
          newRoleID: role
        }),
      });

      if (response.ok) {
        onSave({ role });
        onClose();
      } else {
        const data = await response.json();
        console.error("Erreur lors de la mise à jour du rôle:", data.error);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      const response = await fetch(`/api/organization/${organizationID}/members/invite/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: member.email }),
      });

      if (response.ok) {
        onDelete(member.userID, member.email);
        onClose();
      } else {
        const data = await response.json();
        console.error("Erreur lors de la suppression de l'invitation:", data.error);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'invitation:", error);
    }
  };

  // Fermer si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Auto-close si la souris quitte la modal pendant 1 seconde
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={modalRef}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="w-full max-w-md rounded-lg p-6 shadow-lg bg-white dark:bg-gray-800"
      >
        <Heading>Éditer le membre</Heading>
        <div className="flex items-center mt-4">
          <Avatar
            src={member.profilePicture || 'https://smp-gitops-terraform-state.s3.fr-par.scw.cloud/images/nopp.png'}
            className="size-16"
          />
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {member.name} {member.lastname}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
          </div>
        </div>

        {isInvitation ? (
          <div className="mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Cette personne a été invitée mais n'a pas encore rejoint l'organisation.
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={onClose}>Annuler</Button>
              <Button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Supprimer l'invitation
              </Button>
            </div>
          </div>
        ) : isOwner ? (
          <div className="mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Le rôle de propriétaire ne peut pas être modifié.
            </div>
            <div className="flex justify-end">
              <Button onClick={onClose}>Fermer</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveau rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-700"
              >
                <option value="1">Membre</option>
                <option value="2">Modérateur</option>
                <option value="3">Utilisateur</option>
                <option value="4">Invité</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={onClose}>Annuler</Button>
              <Button type="submit">Sauvegarder</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditMemberModal;
