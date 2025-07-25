// app/(dashboard)/layout.tsx
'use client';

import { getEvents } from "@/src/components/catalyst/data";
import { ApplicationLayout } from "@/src/app/application-layout";
import { DashboardProvider } from "@/context/dashboardContext"; 
import { useAuth } from "@/context/authenticationContext"; 

// export const metadata = {
//   title: "Dashboard Services",
// };

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user?.userID) {
    return <p>Chargement du tableau de bord...</p>;
  }

  return (
    <DashboardProvider>
      <DashboardLayout children={children} />
    </DashboardProvider>
  );
}
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationLayout events={[]}>
      {children}
    </ApplicationLayout>
  );
}
