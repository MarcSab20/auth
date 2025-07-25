// app/team/[organizationID]/page.tsx
import { smpClient } from '@/smpClient';
import Team from '@/src/components/dashboard/organization/members/organizationMembers';
import { Heading } from '@/src/components/catalyst/components/heading';

interface User {
  userID: string;
  email: string;
  name: string;
  lastname: string;
  profilePicture: string;
  title: string;
  status: string;
  role: string;
  username: string;
}

export default async function Page({
  params,
}: {
  params: { organizationID: string };
}) {
  const resp = await smpClient.manageOrganization.members(params.organizationID);
  const initialMembers: User[] = resp.members.map((m: any) => ({
    userID: m.userID,
    email: m.email,
    name: m.name,
    lastname: m.lastname,
    profilePicture: m.profilePicture || "https://smp-gitops-terraform-state.s3.fr-par.scw.cloud/images/nopp.png",
    title: m.title || m.role,
    status: m.status || 'active',
    role: m.role.toString(),
    username: m.username || m.email.split('@')[0],
  }));

  return (
    <>
      <Heading>Gestion des membres</Heading>

      {/* Mode complet : filtres + ajout */}
      <Team
        organizationID={params.organizationID}
        initialMembers={initialMembers}
        viewType="full"
      />
    </>
  );
}

export const revalidate = 3600;
