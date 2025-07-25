// SMPFavoriteDashboard.tsx
import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';

export interface ServiceEntity {
  serviceID: string;
  title: string;
  description: string;
  favoritedAt?: string;
}

const SMPFavoriteDashboard: React.FC = () => {
  const [favoriteServices, setFavoriteServices] = useState<ServiceEntity[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Récupérer les favoris directement depuis le localStorage au montage du composant
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavoriteServices(JSON.parse(storedFavorites));
    }
  }, []);

  // Tri des services favoris selon la date à laquelle ils ont été ajoutés
  const sortedFavorites = [...favoriteServices].sort((a: ServiceEntity, b: ServiceEntity) => {
    if (!a.favoritedAt || !b.favoritedAt) return 0;
    if (sortOrder === 'asc') {
      return new Date(a.favoritedAt).getTime() - new Date(b.favoritedAt).getTime();
    } else {
      return new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime();
    }
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Services Favoris</h2>
      <div className="mb-4">
        <label className="mr-2">Trier par date:</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
          <option value="desc">Les plus récents</option>
          <option value="asc">Les plus anciens</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedFavorites.map((service: ServiceEntity) => (
          <div key={service.serviceID} className="border rounded p-4 flex flex-col">
            <div className="flex justify-end">
              <FaHeart size={20} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg">{service.title}</h3>
            {/* <p className="text-sm text-gray-600">
              {service.description.substring(0, 100)}...
            </p> */}
            <p className="text-xs text-gray-500 mt-2">
              Favorisé le: {service.favoritedAt ? new Date(service.favoritedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SMPFavoriteDashboard;
