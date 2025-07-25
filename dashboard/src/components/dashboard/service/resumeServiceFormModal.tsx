"use client";

import React from "react";
import { Button } from "../../landing-page/Button";

type ResumeServiceModalProps = {
  show: boolean;
  data: {
    title?: string;
    country?: string;
    organizationID?: string;
  };
  onClose: () => void;
  onRestart: () => void;
};

const ResumeServiceModal = ({ show, data, onClose, onRestart }: ResumeServiceModalProps) => {
  if (!show) return null;

  const handleRestart = () => {
      onRestart();
    
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Reprendre la création de mon service
        </h2>
        
        <p className="mb-4 text-gray-700">
          Un service en cours de création a été retrouvé. Voulez-vous reprendre là où vous vous étiez arrêté ?
        </p>

        <div className="mb-6 space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Titre :</span>
            <span className="text-gray-600">{data.title || "Non renseigné"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Pays :</span>
            <span className="text-gray-600">{data.country || "Non renseigné"}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
          <p className="text-sm text-red-600 text-center">⚠️ Cette action est irréversible</p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onClose}
          >
            Continuer
          </Button>
          <Button
            onClick={handleRestart}
            className="px-5 py-2.5 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Recommencer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeServiceModal;
