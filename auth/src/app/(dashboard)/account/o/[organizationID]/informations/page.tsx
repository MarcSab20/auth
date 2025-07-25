// app/dashboard/o/[organizationID]/informations/page.tsx

import { smpClient, initializeSMPClient } from "@/smpClient";
import { UpdateOrganizationProvider } from "@/context/update/organization";
import OrganizationInformation from "@/src/components/dashboard/organization/informations/organizationInformations";

export default async function OrganizationUpdatePage({ params }: { params: { organizationID: string } }) {
  await initializeSMPClient();

  const organization = await smpClient.organization.getById(params.organizationID);
  console.log(organization)
  let location = undefined;

  if (organization?.locationID) {
    location = await smpClient.location.getById(organization.locationID);
  }

  return (
    <UpdateOrganizationProvider
      initialOrganizationData={organization}
      initialLocationData={location}
    >
      <OrganizationInformation organizationID={organization.organizationID} />
    </UpdateOrganizationProvider>
  );
}
