'use client';

import React from 'react';
import { TableUser, Column } from '@/src/components/design/tables/userTables';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/src/components/catalyst/components/dropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { Avatar } from '@/src/components/catalyst/components/avatar';
import { EmptyTeams } from '@/src/components/design/emptyStates/emptyUsers';

interface Member {
  userID: string;
  role: string;
  username: string;
  email: string;
  name: string;
  lastname: string;
  joinedAt?: string;
  profilePicture: string;
}

interface DashboardMemberTableProps {
  people: Member[];
  onEdit: (email: string) => void;
}

export const DashboardMemberTable: React.FC<DashboardMemberTableProps> = ({
  people,
  onEdit,
}) => {
  const columns: Column<Member>[] = [
    {
      header: 'Nom',
      accessor: member => (
        <div className="flex items-center">
          <Avatar
            src={
              member.profilePicture ||
             "https://smp-gitops-terraform-state.s3.fr-par.scw.cloud/images/nopp.png"
            }
            className="h-8 w-8 rounded-full"
          />
          <div className="ml-4">
            <div className="font-medium">{member.name} {member.lastname}</div>
            <div className="text-gray-500 text-sm">{member.username}</div>
          </div>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Rôle', accessor: 'role' },
  ];

  const renderActions = (member: Member) => (
    <Dropdown>
      <DropdownButton plain aria-label="Actions">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </DropdownButton>
      {/* <DropdownMenu anchor="bottom end">
        <DropdownItem onClick={() => onEdit(member.email)}>
          Éditer
        </DropdownItem>
      </DropdownMenu> */}
    </Dropdown>
  );

  return people.length > 1 ? (
    <TableUser
      data={people}
      columns={columns}
      isDense={true}
      renderActions={renderActions}
    />
  ) : (
    <EmptyTeams variant="dashboard" />
  );
};
