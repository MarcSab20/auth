"use client";

import React from 'react';
import { useContractStore } from '@/src/store/contractStore';

/**
 * Composant de démonstration qui affiche les informations sur le template chargé
 */
export default function ContractDemo() {
  const { docTree, variables } = useContractStore();

  return (
    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        🚀 Mode Démonstration
      </h3>
      {/* <p className="text-blue-800 text-sm mb-4">
        Template de démonstration chargé avec des données de test.
        Vous pouvez maintenant tester toutes les fonctionnalités :
      </p> */}
      
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-blue-900 mb-2">✅ Fonctionnalités testables :</h4>
          <ul className="space-y-1 text-blue-700">
            <li>• Édition des sections dans la sidebar</li>
            <li>• Modification du contenu avec TipTap</li>
            <li>• Gestion des variables (bouton Variables)</li>
            <li>• Aperçu avec pagination (bouton Aperçu)</li>
            <li>• Export PDF (bouton Imprimer)</li>
            <li>• Drag & drop des sections</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-blue-900 mb-2">📊 État actuel :</h4>
          <ul className="space-y-1 text-blue-700">
            <li>• {docTree.length} sections chargées</li>
            <li>• {Object.keys(variables).length} variables définies</li>
            <li>• Template : Démonstration</li>
            <li>• Status : Brouillon</li>
            <li>• Format : A4 avec pagination</li>
          </ul>
        </div>
      </div> */}
      
      {/* <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
        <h5 className="font-medium text-blue-900 mb-2">🎯 Actions suggérées :</h5>
        <div className="text-xs space-y-1 text-blue-600">
          <p>1. Cliquez sur une section dans la sidebar pour l'éditer</p>
          <p>2. Utilisez le bouton "Variables" pour modifier les valeurs</p>
          <p>3. Testez l'aperçu avec le bouton "Aperçu"</p>
          <p>4. Essayez d'ajouter une nouvelle section avec le bouton "+"</p>
          <p>5. Exportez en PDF via "Imprimer" → "Enregistrer en PDF"</p>
        </div>
      </div> */}
    </div>
  );
} 