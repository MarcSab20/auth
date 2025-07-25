'use client';

import React from 'react';
import Image from 'next/image';
import Logo from '@/public/images/LOGOROUGE.png'; 
import { useRouter } from 'next/navigation';
import { useServiceContext } from '@/context/create/createServiceContext';

const FinalSlide = () => {
  const router = useRouter();
  const { formData } = useServiceContext();

  const handleDashboardRedirect = () => {
    router.push('/account'); 
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-white via-gray-100 to-gray-200 p-6 opacity-70 ">
      {/* Logo avec animation */}
      <div className="animate-bounce mb-6">
        <Image src={Logo} alt="Logo" width={150} height={150} />
      </div>

      {/* Message de confirmation avec le nom du service */}
      <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
        Félicitations !
      </h2>
      <p className="text-lg text-gray-600 text-center max-w-lg mb-6">
        Votre service <span className="font-bold">{formData.title}</span> a été créé avec succès. Vous pouvez maintenant accéder à votre tableau de bord pour le gérer.
      </p>

      {/* Bouton d'action */}
      <button
        onClick={() => router.push(`/account/${formData.organizationID}/services`)}
        className="bg-black text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition"
      >
        Accéder au Tableau de Bord
      </button>
    </div>
  );
};

export default FinalSlide;
