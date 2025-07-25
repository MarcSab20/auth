'use client';

import { useState } from 'react';
import useSWR from 'swr';
import SMPNotification from '@/src/components/notification';
// Composants Catalyst
import { Button } from '@/src/components/landing-page/Button';
import { Heading, Subheading } from '@/src/components/catalyst/components/heading';
import { Input } from '@/src/components/catalyst/components/input';
import { Select } from '@/src/components/catalyst/components/select';
import { Text } from '@/src/components/catalyst/components/text';
import { Label } from '@/src/components/catalyst/components/label';
import { Divider } from '@/src/components/catalyst/components/divider';
import ProfilePictureSection from './profilePictureSection';

type ProfileData = {
  profileID: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  profilePicture?: { url: string };
  profilePictureID?: string;
};

type ProfileFormProps = {
  initialData: ProfileData;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { data: profile, mutate } = useSWR<ProfileData>(
    `/api/profile/${initialData.profileID}`,
    fetcher,
    { fallbackData: initialData, revalidateOnMount: true }
  );

  // Notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');

  // Erreurs de formulaire
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (fields: Partial<ProfileData>) => {
    const errs: Record<string, string> = {};
    if (!fields.firstName?.trim()) errs.firstName = 'Prénom requis.';
    if (!fields.lastName?.trim()) errs.lastName = 'Nom requis.';
    if (!fields.dateOfBirth) errs.dateOfBirth = 'Date de naissance requise.';
    if (!fields.phoneNumber?.trim()) errs.phoneNumber = 'Numéro de téléphone requis.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    // Collecte des données
    const formData = new FormData(e.currentTarget);
    const updatedFields = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as string,
      nationality: formData.get('nationality') as string,
      phoneNumber: formData.get('phoneNumber') as string,
    };

    // Validation
    const errs = validate(updatedFields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      const response = await fetch(`/api/profile/${initialData.profileID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
      const updatedProfile = await response.json();

      await mutate(updatedProfile, {
        optimisticData: { ...profile, ...updatedFields },
        rollbackOnError: true,
      });
      setNotificationType('success');
      setNotificationMessage('Profil mis à jour avec succès !');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    } catch (error) {
      console.error('Erreur de mise à jour', error);
      setNotificationType('error');
      setNotificationMessage('Erreur lors de la mise à jour du profil');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  const handlePictureUpdate = async (url: string) => {
    try {
      const response = await fetch(`/api/profile/${initialData.profileID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePictureID: url.split('/').pop()?.split('.')[0] }),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour de la photo de profil');
      const updatedProfile = await response.json();
      await mutate(updatedProfile);
    } catch (error) {
      console.error('Erreur de mise à jour de la photo', error);
      setNotificationType('error');
      setNotificationMessage('Erreur lors de la mise à jour de la photo de profil');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  const handlePictureDelete = async () => {
    try {
      const response = await fetch(`/api/profile/${initialData.profileID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePictureID: null }),
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression de la photo de profil');
      const updatedProfile = await response.json();
      await mutate(updatedProfile);
    } catch (error) {
      console.error('Erreur de suppression de la photo', error);
      setNotificationType('error');
      setNotificationMessage('Erreur lors de la suppression de la photo de profil');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  if (!profile) return <Text>Chargement du profil…</Text>;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Titre */}
        <section className="space-y-2">
          <Heading level={2}>Paramètres de Profil</Heading>
          <Text color="secondary">
            Mettez à jour vos informations, elles peuvent être affichées dans certains services.
          </Text>
        </section>
        <Divider soft />

        {/* Photo de profil */}
        <section className="space-y-6">
          <div className="space-y-1">
            <Subheading level={3}>Photo de profil</Subheading>
            <Text color="secondary">Ajoutez une photo pour personnaliser votre profil</Text>
          </div>
          <ProfilePictureSection
            profileID={profile.profileID}
            profilePictureUrl={profile.profilePicture?.url}
            onPictureUpdate={handlePictureUpdate}
            onPictureDelete={handlePictureDelete}
            onNotification={(type, message, description) => {
              setNotificationType(type);
              setNotificationMessage(message);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 5000);
            }}
          />
        </section>

        <Divider soft />

        {/* Informations personnelles */}
        <section className="space-y-6">
          <div className="space-y-1">
            <Subheading level={3}>Informations personnelles</Subheading>
            <Text color="secondary">Parlez-nous de vous</Text>
          </div>
          <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2">
            {/* Prénom */}
            <div>
              <Label>Prénom <span className="text-red-500">*</span></Label>
              <Input
                name="firstName"
                defaultValue={profile.firstName}
                required
                className="mt-1"
              />
              {errors.firstName && <Text className="text-red-500 mt-1">{errors.firstName}</Text>}
            </div>
            {/* Nom */}
            <div>
              <Label>Nom <span className="text-red-500">*</span></Label>
              <Input
                name="lastName"
                defaultValue={profile.lastName}
                required
                className="mt-1"
              />
              {errors.lastName && <Text className="text-red-500 mt-1">{errors.lastName}</Text>}
            </div>
            {/* Date de naissance */}
            <div>
              <Label>Date de naissance <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                name="dateOfBirth"
                defaultValue={profile.dateOfBirth}
                required
                className="mt-1"
              />
              {errors.dateOfBirth && <Text className="text-red-500 mt-1">{errors.dateOfBirth}</Text>}
            </div>
            {/* Genre (optionnel, par défaut Autre) */}
            <div>
              <Label>Genre</Label>
              <Select
                name="gender"
                defaultValue={profile.gender || "other"}
                className="mt-1"
              >
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </Select>
            </div>
          </div>
        </section>

        <Divider soft />

        {/* Détails complémentaires */}
        <section className="space-y-6">
          <div className="space-y-1">
            <Subheading level={3}>Détails</Subheading>
            <Text color="secondary">
              Ces informations nous permettront de vous contacter lorsque nécessaire.
            </Text>
          </div>
          <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2">
            {/* Nationalité (optionnel) */}
            <div>
              <Label>Nationalité</Label>
              <Select
                name="nationality"
                defaultValue={profile.nationality || ""}
                className="mt-1"
              >
                <option value="">-- Choisir --</option>
                <option value="Canada">Canada</option>
                <option value="France">France</option>
                <option value="Cameroun">Cameroun</option>
                <option value="Suisse">Suisse</option>
                <option value="Belgique">Belgique</option>
              </Select>
            </div>
            {/* Téléphone */}
            <div>
              <Label>Numéro de téléphone <span className="text-red-500">*</span></Label>
              <Input
                type="tel"
                name="phoneNumber"
                defaultValue={profile.phoneNumber}
                required
                className="mt-1"
              />
              {errors.phoneNumber && <Text className="text-red-500 mt-1">{errors.phoneNumber}</Text>}
            </div>
          </div>
        </section>

        <Divider soft />

        {/* Bouton d'action */}
        <div className="flex justify-end gap-4">
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>

      {/* Notification */}
      <SMPNotification
        type={notificationType}
        message={notificationMessage}
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
}