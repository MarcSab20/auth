// TestSMPUpload.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import SMPuploadComponent from '@/src/components/design/uploadImage/SMPUploadComponent';
import { FiTrash2, FiStar, FiEdit2 } from 'react-icons/fi';
import { Button } from '@/src/components/landing-page/Button';
import { useUpdateServiceContext } from '@/context/update/service';

interface ServiceMediaInfo {
  serviceMediaID: string;
  listingPosition: number;
  url: string;
  legend?: string;
}

interface ServiceImageManagerProps {
  serviceID: string;
  organizationID: string;
  maxImages?: number;
}

const ServiceImageManager: React.FC<ServiceImageManagerProps> = ({
  serviceID,
  organizationID,
  maxImages = 6, // TODO: Récupérer le maxImages depuis le backend  pour le moment
}) => {
  const {
    serviceMedias,
    addNewImage,
    deleteServiceMedia,
    updateServiceMediaLegend,
    reorderServiceMedias,
    isDirty
  } = useUpdateServiceContext();

  const [isLoading, setIsLoading] = useState(false);
  const [editingLegend, setEditingLegend] = useState<string | null>(null);
  const [newLegend, setNewLegend] = useState('');

  // Filtrer les médias non supprimés pour l'affichage
  const activeMedias = serviceMedias.filter(media => !media.toDelete);

  const handleFileUpload = async (file: File) => {
    if (activeMedias.length >= maxImages) {
      alert(`Vous ne pouvez avoir plus de ${maxImages} images par service`);
      return;
    }

    try {
      setIsLoading(true);
      addNewImage(file, file.name);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsLoading(false);
    }
  }; 

  const handleDeleteImage = async (serviceMediaID: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      setIsLoading(true);
      deleteServiceMedia(serviceMediaID);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMainImage = async (serviceMediaID: string) => {
    try {
      setIsLoading(true);
      
      const targetIndex = activeMedias.findIndex(m => m.serviceMediaID === serviceMediaID);
      if (targetIndex > 0) {
        const newMedias = [...activeMedias];
        const [targetMedia] = newMedias.splice(targetIndex, 1);
        newMedias.unshift(targetMedia);
        
        const reorderedMedias = newMedias.map((media, index) => ({
          ...media,
          listingPosition: index + 1
        }));
        
        reorderServiceMedias(reorderedMedias);
      }
    } catch (error) {
      console.error('Erreur lors de la définition de l\'image principale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(activeMedias);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedItems = items.map((item, index) => ({
      ...item,
      listingPosition: index + 1
    }));

    reorderServiceMedias(reorderedItems);
  };

  const handleEditLegend = async (serviceMediaID: string) => {
    try {
      setIsLoading(true);
      updateServiceMediaLegend(serviceMediaID, newLegend);
      setEditingLegend(null);
      setNewLegend('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la légende:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && activeMedias.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Chargement des images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Gestion des images de votre Service ({activeMedias.length}/{maxImages})</h3>
        <div className="text-sm text-gray-500">
          {maxImages - activeMedias.length} image(s) restante(s)
          {isDirty && <span className="ml-2 text-orange-500">• Modifications non sauvegardées</span>}
        </div>
      </div>

      {/* Images Grid with Drag & Drop et Upload intégré */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {/* Images existantes */}
              {activeMedias
                .sort((a, b) => a.listingPosition - b.listingPosition)
                .map((media, index) => (
                  <Draggable
                    key={media.serviceMediaID}
                    draggableId={media.serviceMediaID}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          relative group bg-white rounded-lg overflow-hidden shadow-md
                          ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
                          ${media.listingPosition === 1 ? 'ring-2 ring-green-500' : ''}
                          ${media.isNew ? 'ring-2 ring-yellow-500' : ''}
                        `}
                      >
                        {/* Image avec aspect ratio 400:300 */}
                        <div className="relative" style={{ aspectRatio: '400/300' }}>
                          <img
                            src={media.url}
                            alt={media.legend || `Image ${media.listingPosition}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex gap-2">
                            <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                              {media.listingPosition}
                            </div>
                            {media.isNew && (
                              <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                Nouveau
                              </div>
                            )}
                          </div>
                          
                          {/* Main Image Badge - Cliquable */}
                          <div 
                            className={`absolute top-2 right-2 p-1 rounded cursor-pointer ${
                              media.listingPosition === 1 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-500 bg-opacity-75 text-white hover:bg-green-500'
                            }`}
                            onClick={() => handleSetMainImage(media.serviceMediaID)}
                            title={media.listingPosition === 1 ? 'Image principale' : 'Cliquer pour définir comme image principale'}
                          >
                            <FiStar size={14} />
                          </div>
                          
                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingLegend(media.serviceMediaID);
                                  setNewLegend(media.legend || '');
                                }}
                                disabled={isLoading}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                title="Modifier la légende"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteImage(media.serviceMediaID)}
                                disabled={isLoading}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                title="Supprimer"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="p-3">
                          {editingLegend === media.serviceMediaID ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={newLegend}
                                onChange={(e) => setNewLegend(e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Entrez une légende..."
                                autoFocus
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleEditLegend(media.serviceMediaID)}
                                  disabled={isLoading}
                                  className="text-xs"
                                >
                                  Sauvegarder
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingLegend(null);
                                    setNewLegend('');
                                  }}
                                  className="text-xs"
                                >
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600 truncate">
                              {media.legend || 'Aucune légende'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

              {/* Composant d'upload intégré à la grille */}
              {activeMedias.length < maxImages && (
                <div 
                  className="bg-white rounded-lg overflow-hidden shadow-md border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                  style={{ aspectRatio: '400/300' }}
                >
                  <div className="h-full flex items-center justify-center">
                    <SMPuploadComponent 
                      uploadType="image" 
                      allowedExtensions={['jpg', 'jpeg', 'png', 'gif', 'webp']}
                      onFileUpload={handleFileUpload}
                      cropAspectRatio={400 / 300}
                    />
                  </div>
                </div>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Instructions */}
      {activeMedias.length > 1 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p>💡 <strong>Instructions:</strong></p>
          <ul className="mt-1 space-y-1 ml-4 list-disc">
            <li>Glissez-déposez les images pour les réorganiser</li>
            <li>Cliquez sur l'étoile pour définir l'image principale</li>
            <li>Format recommandé: 400x300 pixels pour un affichage cohérent</li>
            <li>Maximum {maxImages} images</li>
            <li>Survolez une image pour voir les actions disponibles</li>
            <li>Les images avec un cadre jaune sont nouvelles et seront uploadées lors de la sauvegarde</li>
          </ul>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-4">Traitement en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceImageManager;
