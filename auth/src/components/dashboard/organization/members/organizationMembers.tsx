// src/components/dashboard/organization/members/Team.tsx
'use client';

import React, { useState } from 'react';
import { DashboardMemberTable } from '@/src/components/dashboard/organization/members/dashboardMemberTable';
import AdvancedMemberTable from '@/src/components/dashboard/organization/members/advancedMemberTable';
import InviteMemberModal from './inviteMemberModal';
import EditMemberModal from './editMemberModal';
import { Subheading } from '@/src/components/catalyst/components/heading';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from '@/src/components/catalyst/components/dropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export interface User {
  userID: string;
  email: string;
  name: string;
  lastname: string;
  username: string;
  role: string;
  profilePicture: string;
  status: string;
  title: string;
}

interface TeamProps {
  organizationID: string;
  initialMembers: User[];
  /** 'dashboard' = compact view | 'full' = tableau complet avec filtres & ajout */
  viewType?: 'dashboard' | 'full';
}

export default function Team({
  organizationID,
  initialMembers,
  viewType = 'dashboard',
}: TeamProps) {
  const [members, setMembers] = useState<User[]>(initialMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);

  const handleSendInvitation = async (data: { email: string; message: string }) => {
    const tempMember: User = {
      userID: `invitation_${data.email}`,
      email: data.email,
      name: "Invitation",
      lastname: "Pending",
      username: data.email.split('@')[0],
      role: "Member",
      profilePicture: "https://smp-gitops-terraform-state.s3.fr-par.scw.cloud/images/nopp.png",
      status: "En cours",
      title: "Nouveau membre"
    };
    setMembers(prev => [...prev, tempMember]);
    try {
      const response = await fetch(`/api/organization/${organizationID}/members/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        setMembers(prev => prev.filter(m => m.email !== data.email));
      }
    } catch (error) {
      setMembers(prev => prev.filter(m => m.email !== data.email));
    }
  };

  const handleEdit = (email: string) => {
    const member = members.find(u => u.email === email);
    if (member) {
      setEditingMember(member);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (updatedData: Partial<User>) => {
    if (!editingMember) return;
    const previousMember = { ...editingMember };
    setMembers(prev =>
      prev.map(u =>
        u.email === editingMember.email ? { ...u, ...updatedData } : u
      )
    );
    try {
      const response = await fetch(`/api/organization/${organizationID}/members/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: editingMember.userID,
          newRoleID: updatedData.role
        }),
      });
      if (!response.ok) {
        // rollback si nécessaire
        setMembers(prev =>
          prev.map(u =>
            u.email === editingMember.email ? previousMember : u
          )
        );
      }
    } catch (error) {
      // rollback si nécessaire
      setMembers(prev =>
        prev.map(u =>
          u.email === editingMember.email ? previousMember : u
        )
      );
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = async (userID: string) => {
    const memberToDelete = members.find(m => m.userID === userID);
    if (!memberToDelete) return;

    setMembers(prev => prev.filter(m => m.userID !== userID));
    try {
      const response = await fetch(`/api/organization/${organizationID}/members/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID }),
      });
      if (!response.ok) {
        // rollback si nécessaire
        setMembers(prev => [...prev, memberToDelete]);
      }
    } catch (error) {
      // rollback si nécessaire
      setMembers(prev => [...prev, memberToDelete]);
    }
  };

  const renderActions = (u: User) => (
    <Dropdown>
      <DropdownButton plain aria-label="Actions">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        {u?.userID?.startsWith('invitation_') ? (
          <DropdownItem 
            onClick={() => handleDelete(u.userID)}
            className="text-red-500 hover:text-red-600"
          >
            Supprimer l'invitation
          </DropdownItem>
        ) : u.role !== "Owner" ? (
          <DropdownItem onClick={() => handleEdit(u.email)}>Éditer</DropdownItem>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div>
      <Subheading className="mt-14 mb-5">Membres de mon organisation</Subheading>

      {viewType === 'dashboard' ? (
        <DashboardMemberTable people={members} onEdit={handleEdit} />
      ) : (
        <AdvancedMemberTable
          people={members}
          onEdit={handleEdit}
          onAdd={() => setIsInviteModalOpen(true)}
          onDelete={handleDelete}
        />
      )}

      {viewType === 'full' && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSend={handleSendInvitation}
          organizationID={organizationID}
          existingEmails={members.map(u => u.email.toLowerCase())}
        />
      )}

      {viewType === 'full' && editingMember && (
        <EditMemberModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          member={editingMember}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          organizationID={organizationID}
        />
      )}
    </div>
  );
}
