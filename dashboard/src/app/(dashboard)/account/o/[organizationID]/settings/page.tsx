import { UpdateOrganizationProvider } from "@/context/update/organization";
import OrganizationSettings from "@/src/components/dashboard/organization/settings/organizationSettings";
import { smpClient } from "@/smpClient";

export default async function OrganizationUpdatePage({ params }: { params: { organizationID: string } }) {
  const organizationID = params.organizationID;

  if (!organizationID) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Aucune organisation spécifiée.</p>
      </div>
    );
  }

  const organizationData = await smpClient.organization.getById(organizationID);

  let locationData = {};
  if (organizationData?.locationID) {
    const location = await smpClient.location.getById(organizationData.locationID);
    if (location) {
      locationData = {
        locationID: location.placeID,
        addressLine1: location.addressLine1,
        city: location.city,
        postalCode: location.postalCode,
        country: location.country,
        placeKind: location.placeKind,
      };
    }
  }

  return (
    <UpdateOrganizationProvider
      initialOrganizationData={organizationData}
      initialLocationData={locationData}
    >
      <OrganizationSettings organizationID={organizationID} />
    </UpdateOrganizationProvider>
  );
}
