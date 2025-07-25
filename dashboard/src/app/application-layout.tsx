'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Avatar } from '@/src/components/catalyst/components/avatar';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/src/components/catalyst/components/dropdown';
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from '@/src/components/catalyst/components/navbar';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,  
  SidebarHeading,
} from '@/src/components/catalyst/components/sidebar';
import { SidebarLayout } from '@/src/components/catalyst/components/sidebar-layout';
import { getEvents } from '@/src/components/catalyst/data';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Cog8ToothIcon,
  ShieldCheckIcon,
  LightBulbIcon,
} from '@heroicons/react/20/solid';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/authenticationContext';
import { useOrganizations } from '@/src/hooks/useOrganizations';
import { useProfilePicture } from '@/src/hooks/useProfilePicture';
import { Organization } from '@/src/store/organizationStore';

export function ApplicationLayout({
  events,
  children,
}: {
  events: Awaited<ReturnType<typeof getEvents>>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganizations();
  const defaultAvatar = "/images/icons/nopp.png";
  const profilePictureUrl = useProfilePicture();

  // Profile-mode detection
  const isProfileMode =
    pathname === '/account' ||
    pathname.startsWith('/account/details') ||
    pathname.startsWith('/account/orders') ||
    pathname.startsWith('/account/commandes') ||
    pathname.startsWith('/account/estimates') ||
    pathname.startsWith('/account/devis') ||
    pathname.startsWith('/account/invoices') ||
    pathname.startsWith('/account/factures') ||
    pathname === '/account/organizations/new';

  // Organization-mode detection & extract ID from URL
  const isOrganizationMode = pathname.startsWith('/account/o/');
  const segments = pathname.split('/');
  const currentOrgId = isOrganizationMode && segments.length >= 4 ? segments[3] : null;

  // Derive selectedOrg from URL (fallback to first in nav)
  const selectedOrg = useMemo(() => {
    if (isOrganizationMode && currentOrgId) {
      return (
        organizations.find((org) => org.organizationID === currentOrgId) ||
        organizations[0]
      );
    }
    return organizations[0] || null;
  }, [organizations, isOrganizationMode, currentOrgId]);

  const handleOrganizationChange = (org: Organization) => {
    setCurrentOrganization(org);
    router.push(`/account/o/${org.organizationID}`);
  };

  const dropdownItemHover = 'hover:bg-gray-100 dark:hover:bg-gray-800';

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar
                  className="h-8 w-8"
                  src={profilePictureUrl || defaultAvatar}
                  square
                />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem href="/account/details" className={dropdownItemHover}>
                  <UserCircleIcon data-slot="icon" />
                  <DropdownLabel>Mon Profil</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/settings" className={dropdownItemHover}>
                  <Cog8ToothIcon data-slot="icon" />
                  <DropdownLabel>Paramètres</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem className="cursor-not-allowed opacity-50">
                  <ShieldCheckIcon data-slot="icon" />
                  <DropdownLabel>Politique de Confidentialité</DropdownLabel>
                </DropdownItem>
                <DropdownItem className="cursor-not-allowed opacity-50">
                  <LightBulbIcon data-slot="icon" />
                  <DropdownLabel>Mes Préférences</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={logout} className={dropdownItemHover}>
                  <ArrowRightStartOnRectangleIcon data-slot="icon" />
                  <DropdownLabel>Déconnexion</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          {/* Sidebar Header */}
          {organizations.length === 0 && !isProfileMode ? (
            <SidebarHeader>
              <SidebarItem href="/account/organizations/new">
                <PlusIcon data-slot="icon" />
                <SidebarLabel>Créer une organisation</SidebarLabel>
              </SidebarItem>
            </SidebarHeader>
          ) : (
            <SidebarHeader>
              {isProfileMode ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Image
                      className="dark:hidden"
                      src="/images/ROUGENOIR.png"
                      alt="Logo SMP clair"
                      width={110}
                      height={110}
                    />
                    <Image
                      className="hidden dark:block"
                      src="/images/ROUGEBLANC.png"
                      alt="Logo SMP sombre"
                      width={110}
                      height={110}
                    />
                  </div>
                  <Dropdown>
                    <DropdownButton as="button" className="flex items-center">
                      {selectedOrg ? (
                        <>
                          <span className="mr-1">{selectedOrg.name}</span>
                          <ChevronDownIcon data-slot="icon" className="size-4" />
                        </>
                      ) : (
                        <ChevronDownIcon data-slot="icon" className="size-4" />
                      )}
                    </DropdownButton>
                    <DropdownMenu className="min-w-40 lg:min-w-34 mt-8 ml-3" anchor="bottom end">
                      {organizations.map((org) => (
                        <DropdownItem
                          key={org.organizationID}
                          onClick={() => handleOrganizationChange(org)}
                          className={dropdownItemHover}
                        >
                          <DropdownLabel>{org.name}</DropdownLabel>
                        </DropdownItem>
                      ))}
                      <DropdownDivider />
                      <DropdownItem href="/account/organizations/new" className={dropdownItemHover}>
                        <PlusIcon data-slot="icon" />
                        <DropdownLabel>Nouvelle Organisation…</DropdownLabel>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ) : (
                <Dropdown>
                  <DropdownButton as={SidebarItem}>
                    <div className="flex items-center">
                      {selectedOrg?.icon ? (
                        <img
                          src={selectedOrg.icon}
                          alt={`Logo ${selectedOrg.name}`}
                          width={40}
                          height={40}
                          className="rounded-md object-contain"
                        />
                      ) : (
                        <>
                          <Image
                            className="dark:hidden"
                            src="/images/LOGOROUGE.png"
                            alt="Logo SMP clair"
                            width={30}
                            height={30}
                          />
                          <Image
                            className="hidden dark:block"
                            src="/images/LOGOBLANC.png"
                            alt="Logo SMP sombre"
                            width={30}
                            height={30}
                          />
                        </>
                      )}
                    </div>
                    <SidebarLabel className="text-lg font-bold">
                      {selectedOrg?.name || ''}
                    </SidebarLabel>
                    <ChevronDownIcon data-slot="icon" className="ml-auto size-4" />
                  </DropdownButton>
                  <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                    <DropdownItem
                      href={`/account/o/${selectedOrg?.organizationID}/settings`}
                      className={dropdownItemHover}
                    >
                      <DropdownLabel>Paramètres</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    {organizations.map((org) => (
                      <DropdownItem
                        key={org.organizationID}
                        onClick={() => handleOrganizationChange(org)}
                        className={dropdownItemHover}
                      >
                        <DropdownLabel>{org.name}</DropdownLabel>
                      </DropdownItem>
                    ))}
                    <DropdownDivider />
                    <DropdownItem href="/account/organizations/new" className={dropdownItemHover}>
                      <PlusIcon data-slot="icon" />
                      <DropdownLabel>Nouvelle Organisation…</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
            </SidebarHeader>
          )}

          {/* Sidebar Body */}
          <SidebarBody>
            {isProfileMode ? (
              <SidebarSection>
                <SidebarItem href="/account" current={pathname === '/account'}>
                  <SidebarLabel>Mon Compte</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/account/details" current={pathname === '/account/details'}>
                  <SidebarLabel>Mon Profil</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/account/orders" current={pathname.startsWith('/account/orders')}>
                  <SidebarLabel>Mes Commandes</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/account/estimates" current={pathname.startsWith('/account/estimates')}>
                  <SidebarLabel>Mes Devis</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/account/invoices" current={pathname.startsWith('/account/invoices')}>
                  <SidebarLabel>Mes Factures</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            ) : (
              <>
                <SidebarSection>
                  <SidebarHeading>Organisation</SidebarHeading>
                  <SidebarItem
                    href={`/account/o/${selectedOrg?.organizationID}`}
                    current={pathname === `/account/o/${selectedOrg?.organizationID}`}
                  >
                    <SidebarLabel>Accueil</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={`/account/o/${selectedOrg?.organizationID}/services`}
                    current={pathname === `/account/o/${selectedOrg?.organizationID}/services`}
                  >
                    <SidebarLabel>Services</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={`/account/o/${selectedOrg?.organizationID}/assets`}
                    current={pathname === `/account/o/${selectedOrg?.organizationID}/assets`}
                  >
                    <SidebarLabel>Assets</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={`/account/o/${selectedOrg?.organizationID}/teams`}
                    current={pathname === `/account/o/${selectedOrg?.organizationID}/teams`}
                  >
                    <SidebarLabel>Équipes</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={`/account/o/${selectedOrg?.organizationID}/informations`}
                    current={pathname === `/account/o/${selectedOrg?.organizationID}/informations`}
                  >
                    <SidebarLabel>Informations</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={`/account/o/${selectedOrg?.organizationID}/settings`}
                    current={pathname === `/account/o/${selectedOrg?.organizationID}/settings`}
                  >
                    <SidebarLabel>Paramètres</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection>
                  <SidebarHeading>Comptabilité</SidebarHeading>
                  <SidebarItem className="opacity-50 cursor-not-allowed pointer-events-none">
                    <SidebarLabel className="text-gray-400">Transactions  <span  className="text-xs text-gray-500">BETA</span></SidebarLabel>
                  </SidebarItem>
                  <SidebarItem className="opacity-50 cursor-not-allowed pointer-events-none" href={`/account/o/${selectedOrg?.organizationID}/accounting/estimates`} current={pathname === `/account/o/${selectedOrg?.organizationID}/accounting/estimates`}>
                    <SidebarLabel>Devis <span className="text-xs text-gray-500">BETA</span></SidebarLabel>
                  </SidebarItem>
                  <SidebarItem className="opacity-50 cursor-not-allowed pointer-events-none" href={`/account/o/${selectedOrg?.organizationID}/accounting/invoices`} current={pathname === `/account/o/${selectedOrg?.organizationID}/accounting/invoices`}>
                    <SidebarLabel>Factures <span className="text-xs text-gray-500">BETA</span></SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={`/account/o/${selectedOrg?.organizationID}/accounting/customers`}
                    current={pathname === `/account/o/${selectedOrg?.organizationID}/accounting/customers`}
                  >                    <SidebarLabel>Clients</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href={`/account/o/${selectedOrg?.organizationID}/accounting/suppliers`} current={pathname === `/account/o/${selectedOrg?.organizationID}/accounting/suppliers`}>
                    <SidebarLabel>Fournisseurs</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection>
                  <SidebarHeading>Documents</SidebarHeading>
                  <SidebarItem href={`/account/o/${selectedOrg?.organizationID}/contracts`}  current={pathname === `/account/o/${selectedOrg?.organizationID}/contracts`}>
                    <SidebarLabel>Contrats <span className="text-xs text-gray-500">BETA</span></SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection>
                  <SidebarHeading>Supports</SidebarHeading>
                  <SidebarItem className="cursor-not-allowed opacity-50">
                    <SidebarLabel>Équipe support</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem className="cursor-not-allowed opacity-50">
                    <SidebarLabel>Conversations</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </>
            )}

            <SidebarSection className="max-lg:hidden mt-6">
              {events.map((event) => (
                <SidebarItem key={event.id}>
                  <SidebarLabel>{event.name}</SidebarLabel>
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="#">
                <QuestionMarkCircleIcon data-slot="icon" />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="#">
                <DocumentTextIcon data-slot="icon" />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          {/* Sidebar Footer */}
          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={profilePictureUrl || defaultAvatar}
                    className="size-10"
                    square
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-950 dark:text-white">
                      {user?.username || 'Utilisateur'}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user?.email || 'email@exemple.com'}
                    </p>
                  </div>
                </span>
                <ChevronUpIcon data-slot="icon" />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="top start">
                <DropdownItem href="/account/details" className={dropdownItemHover}>
                  <UserCircleIcon data-slot="icon" />
                  <DropdownLabel>Mon Profil</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/settings" className={dropdownItemHover}>
                  <Cog8ToothIcon data-slot="icon" />
                  <DropdownLabel>Paramètres</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem className="cursor-not-allowed opacity-50">
                  <ShieldCheckIcon data-slot="icon" />
                  <DropdownLabel>Politique de Confidentialité</DropdownLabel>
                </DropdownItem>
                <DropdownItem className="cursor-not-allowed opacity-50">
                  <LightBulbIcon data-slot="icon" />
                  <DropdownLabel>Mes Préférences</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={logout} className={dropdownItemHover}>
                  <ArrowRightStartOnRectangleIcon data-slot="icon" />
                  <DropdownLabel>Déconnexion</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
