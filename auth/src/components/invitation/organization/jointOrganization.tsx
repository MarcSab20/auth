"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrganizationSignupForm from "@/src/components/invitation/organization/organizationSignupForm";
import AcceptInvitation from "@/src/components/invitation/organization/acceptInvitation";
import InvitationError from "@/src/components/invitation/organization/InvitationError";

export default function JoinOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [organizationID, setOrganizationID] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userID, setUserID] = useState<string>("");

  const verifyInvitationToken = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/organization/${organizationID}/members/invite/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify invitation');
      }
 
      if (!data.success) {
        throw new Error(data.error || 'Invalid invitation');
      }

      // Mise à jour des états avec les données de l'invitation
      setEmail(data.email);
      setOrganizationID(data.organizationID);
      setIsExistingUser(data.userExists);
      setFirstName(data.firstName || null);
      setLastName(data.lastName || null);
      
      // Gestion du userID
      if (data.userExists && data.userID) {
        setUserID(data.userID);
      }


    } catch (error: any) {
      console.error("Error verifying invitation token:", error);
      setError(error.message || "Failed to verify the invitation token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const token = searchParams.get("token");
    if (token) {
      verifyInvitationToken(token);
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing token in the URL");
      setIsLoading(false);
      return;
    }
    verifyInvitationToken(token);
  }, [searchParams]);

  if (isLoading) {
    return <div className="flex items-center justify-center ">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <InvitationError error={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (isExistingUser === null || !email || !organizationID) {
    return (
      <div className=" items-center ">
        <InvitationError error="Invalid invitation data" onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center overflow-hidden">
      {isExistingUser ? (
        <AcceptInvitation
          email={email}
          organizationID={organizationID}
          firstName={firstName || undefined}
          lastName={lastName || undefined}
          userID={userID}
        />
      ) : (
        <OrganizationSignupForm
          email={email}
          organizationID={organizationID}
          firstName={firstName || undefined}
          lastName={lastName || undefined}
        />
      )}
    </div>
  );
}