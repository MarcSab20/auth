// app/dashboard/[organizationID]/page.tsx
import { smpClient } from '@/smpClient';
import Team from '@/src/components/dashboard/organization/members/organizationMembers';
import { Stat } from '@/src/components/dashboard/stats/stat';
import { Heading, Subheading } from '@/src/components/catalyst/components/heading';
import { Select } from '@/src/components/catalyst/components/select';

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
  console.log('Members data:', JSON.stringify(resp.members, null, 2));
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
      <Heading>Dashboard de mon organisation</Heading>

      <div className="mt-8 flex items-end justify-between">
              <Subheading>Overview</Subheading>
              <div>
                <Select name="period">
                  <option value="last_week">Last week</option>
                  <option value="last_two">Last two weeks</option>
                  <option value="last_month">Last month</option>
                  <option value="last_quarter">Last quarter</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              <Stat title="Total des revenus " value="0" change="+4.5%" />
              <Stat title="Valeur moyenne des commandes" value="0" change="-0.5%" />
              <Stat title="Vues des services " value="0" change="+21.2%" />
            </div>

      {/* Mode compact */}
      <Team
        organizationID={params.organizationID}
        initialMembers={initialMembers}
        viewType="dashboard"
      />
    </>
  );
}

export const revalidate = 3600;
