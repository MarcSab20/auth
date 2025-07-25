"use client";

import React from "react";
import { Heading } from "@/src/components/catalyst/components/heading";
import { Button } from "@/src/components/landing-page/Button";
import { useRouter } from "next/navigation";

interface FinalSlideProps {
  onValidateStep: (isValid: boolean) => void;
  serviceID: string;
  organizationID: string;
}

const FinalSlide: React.FC<FinalSlideProps> = ({ serviceID, organizationID }) => {
  const router = useRouter();

  const handleBackToAssets = () => {
    router.push(`/account/o/${organizationID}/services/${serviceID}/assets`);
  };

  return (
    <div className="text-center space-y-6">
      <Heading level={3}>Félicitations !</Heading>
      <p className="text-lg text-gray-600">
        Votre asset a été créé avec succès.
      </p>
      <div className="pt-4">
        <Button
          onClick={handleBackToAssets}
          className="bg-black text-white px-6 py-3 rounded-lg text-lg shadow hover:bg-gray-800 transition duration-200"
        >
          Retour aux assets
        </Button>
      </div>
    </div>
  );
};

export default FinalSlide; 