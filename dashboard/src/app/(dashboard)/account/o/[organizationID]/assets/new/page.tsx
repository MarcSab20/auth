// src/app/account/organization/[organizationID]/assets/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AssetCreationCarousel from "@/src/components/dashboard/asset/assetForm";
import { useAuth } from "@/context/authenticationContext";
import { useDashboardContext } from "@/context/dashboardContext";
import { Button } from "@/src/components/landing-page/Button";
import Link from "next/link";
import { AssetProvider } from "@/context/create/createAssetContext";

const AssetCreationPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  // Toujours fournir une string, jamais null/undefined
  const organizationID = params.organizationID?.toString() ?? "";

  const { getUserID, authLoading } = useAuth();
  const userID = getUserID();

  const { organizationNav, loadingOrganizations } = useDashboardContext();

  const [unauthorized, setUnauthorized] = useState(false);

  // Vérification des droits sur l’orga
  useEffect(() => {
    if (!loadingOrganizations && organizationID) {
      const allowed = organizationNav.some(
        (org) =>
          org.organizationID === organizationID &&
          (org.role === "Owner" || org.role === "Admin")
      );
      setUnauthorized(!allowed);
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
          Vous n'êtes pas autorisé à créer un asset pour cette organisation.
        </p>
        <Link href="/account/organization">
          <Button>Retour aux organisations</Button>
        </Link>
      </div>
    );
  }

  return (
    <AssetProvider>
      <AssetCreationCarousel organizationID={organizationID} />
    </AssetProvider>
  );
};

export default AssetCreationPage;
