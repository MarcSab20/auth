import { Suspense } from "react";
import JoinOrganizationPage from "@/src/components/invitation/organization/jointOrganization";
export default function JoinOrganizationPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinOrganizationPage />
    </Suspense>
  );
}