'use client';

import React, { useState, useMemo } from 'react';
import { TableUser, Column } from '@/src/components/design/tables/userTables';
import { Button } from '@/src/components/landing-page/Button';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/src/components/catalyst/components/dropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Avatar } from '@/src/components/catalyst/components/avatar';
import { EmptyTeams } from '@/src/components/design/emptyStates/emptyUsers';

interface User {
  profilePicture: string;
  userID: string;
  email: string;
  name: string;
  lastname: string;
  status: string;
  role: string;
  username: string;
}

interface AdvancedMemberTableProps {
  people: User[];
  onEdit: (email: string) => void;
  onAdd: () => void;
  onDelete: (userID: string, email: string) => void;
}

export default function AdvancedMemberTable({
  people,
  onEdit,
  onAdd,
  onDelete,
}: AdvancedMemberTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const roles = useMemo(
    () => Array.from(new Set(people.map(u => u.role))),
    [people]
  );
  const statuses = useMemo(
    () => Array.from(new Set(people.map(u => u.status))),
    [people]
  );

  const filtered = useMemo(() => {
    return people
      .filter(u =>
        [u.name, u.lastname, u.email, u.username]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter(u => (roleFilter ? u.role === roleFilter : true))
      .filter(u => (statusFilter ? u.status === statusFilter : true));
  }, [people, search, roleFilter, statusFilter]);

  const columns: Column<User>[] = [
    {
      header: 'Nom',
      accessor: u => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={u.profilePicture || "https://smp-gitops-terraform-state.s3.fr-par.scw.cloud/images/nopp.png"}
            className="h-10 w-10 rounded-full"
            // alt={`${u.name} ${u.lastname}`}
          />
          <div>
            <div className="font-medium text-sm">
              {u.name} {u.lastname}
            </div>
            <div className="text-gray-500 text-xs">{u.username}</div>
          </div>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Rôle', accessor: 'role' },
    { header: 'Statut', accessor: 'status' },
  ];

  const renderActions = (u: User) => (
    <Dropdown>
      <DropdownButton plain aria-label="Actions">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        {u.userID.startsWith('invitation_') ? (
          <DropdownItem 
            onClick={() => onDelete(u.userID, u.email)}
            className="text-red-500 hover:text-red-600"
          >
            Supprimer l'invitation
          </DropdownItem>
        ) : (
          <DropdownItem onClick={() => onEdit(u.email)}>Éditer</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center flex-wrap gap-2">
          <Button onClick={onAdd}>Ajouter un membre</Button>
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="
                h-10 w-full sm:w-64
                px-3 pl-10
                border border-gray-300
                rounded-lg
                focus:outline-none focus:ring focus:border-blue-300
              "
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="
                h-10 w-full sm:w-40
                px-3 pr-8
                border border-gray-300
                rounded-lg appearance-none
                focus:outline-none focus:ring focus:border-blue-300
              "
            >
              <option value="">Tous les rôles</option>
              {roles.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="
                h-10 w-full sm:w-40
                px-3 pr-8
                border border-gray-300
                rounded-lg appearance-none
                focus:outline-none focus:ring focus:border-blue-300
              "
            >
              <option value="">Tous les statuts</option>
              {statuses.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length > 1 ? (
        <TableUser
          data={filtered}
          columns={columns}
          renderActions={renderActions}
          isDense={false}
        />
      ) : (
        <EmptyTeams
          variant="advanced"
          action={{ label: 'Ajouter un membre', onClick: onAdd }}
        />
      )}
    </>
  );
}
