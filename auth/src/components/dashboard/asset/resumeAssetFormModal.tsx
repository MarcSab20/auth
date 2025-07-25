"use client";

import React from "react";
import { Dialog } from "@/src/components/catalyst/components/dialog";
import { Button } from "@/src/components/landing-page/Button";
import { Heading } from "@/src/components/catalyst/components/heading";

interface ResumeAssetFormModalProps {
  show: boolean;
  data: {
    title: string;
    description: string;
    price: number;
  };
  onClose: () => void;
  onRestart: () => void;
}

const ResumeAssetFormModal: React.FC<ResumeAssetFormModalProps> = ({
  show,
  data,
  onClose,
  onRestart,
}) => {
  if (!show) return null;

  return (
    <Dialog open={show} onClose={onClose}>
      <div className="p-6">
        <Heading level={3}>Reprendre la création</Heading>
        <p className="mt-2 text-gray-600">
          Vous avez une création d'asset en cours : "{data.title}".
          Souhaitez-vous la reprendre ou recommencer depuis le début ?
        </p>
        <div className="mt-6 flex justify-end gap-4">
          <Button
            onClick={onRestart}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            Recommencer
          </Button>
          <Button
            onClick={onClose}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Reprendre
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ResumeAssetFormModal; 