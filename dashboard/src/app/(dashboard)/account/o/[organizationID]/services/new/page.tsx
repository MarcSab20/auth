"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ServiceCreationCarousel from "@/src/components/dashboard/service/serviceForm";
import { useAuth } from "@/context/authenticationContext";
import { useDashboardContext } from "@/context/dashboardContext";
import { Button } from '@/src/components/landing-page/Button'
import Link from "next/link";
import {ServiceProvider} from "@/context/create/createServiceContext";

const ServiceCreationPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const organizationID = params?.organizationID?.toString() || null;

  const { getUserID, authLoading } = useAuth();
  const userID = getUserID();

  const { organizationNav, loadingOrganizations } = useDashboardContext();

  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!loadingOrganizations && organizationID && organizationNav.length > 0) {
      const allowedOrg = organizationNav.find(
        (org) =>
          org.organizationID === organizationID &&
          (org.role === "Owner" || org.role === "Admin")
      );
      if (!allowedOrg) {
        setUnauthorized(true);
      }
    }
  }, [organizationID, organizationNav, loadingOrganizations]);

  if (authLoading || loadingOrganizations) {
    return <div>Chargement...</div>;
  }

  if (organizationID && unauthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Accès refusé</h2>
        <p className="text-gray-700 mb-8">
          Vous n'êtes pas autorisé à créer un service pour cette organisation.
        </p>
        
        <Link href="/account/organization">
          <Button>Retour aux organisations</Button>
        </Link>
      </div>
    );
  }

  return (
    <ServiceProvider>
      <ServiceCreationCarousel
        // initialOrganizations={organizationNav}
        organizationID={organizationID}
      />
    </ServiceProvider>
  );
};

export default ServiceCreationPage;
