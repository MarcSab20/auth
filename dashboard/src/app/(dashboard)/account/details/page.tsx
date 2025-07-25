import React from 'react';
import { cookies } from 'next/headers';
import { smpClient, initializeSMPClient } from '@/smpClient';
import ProfileForm from '@/src/components/dashboard/user/profile/profilInformations/profileForm';

export default async function ProfilePage() {
  await initializeSMPClient();

  const cookieStore = cookies();
  const userCookie = cookieStore.get("smp_user_0");
  if (!userCookie) {
    return <div className="text-center py-10">Utilisateur non connecté</div>;
  }

  const parsedUser = JSON.parse(decodeURIComponent(userCookie.value));
  const profileID = parsedUser?.profileID;
  console.log(parsedUser?.profileID,"#@@@@@@@@@@@@@@@@@@@@@@")

  if (!profileID) {
    return <div className="text-center py-10">Aucun profil associé</div>;
  }

  try {
    const profile = await smpClient.profile.getProfile(profileID);

    return (
      <div className="mx-auto max-w-4xl">
        <ProfileForm initialData={profile} />
      </div>
    );
  } catch (error) {
    console.error("Erreur chargement profil :", error);
    return <div className="text-center py-10">Erreur lors du chargement du profil</div>;
  }
}
