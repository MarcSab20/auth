// app/organization/creation/page.tsx
import { Metadata } from 'next';
import OrganizationCreationCarousel from '@/src/components/dashboard/organization/organizationForm';

export const metadata: Metadata = {
  title: "Création d'Organisation",
};

export default function CreateOrganizationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <OrganizationCreationCarousel />
    </div>
  );
}
