// FavoriteContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { smpClient } from '@/smpClient'; // ajustez le chemin selon votre organisation

export type FavoriteService = {
  serviceID: string;
  favoritedAt: string;
};

export type ServiceEntity = {
  serviceID: string;
  title: string;
  description: string;
  favoritedAt?: string;
};

type FavoriteContextType = {
  favorites: FavoriteService[];
  favoriteServices: ServiceEntity[];
  addFavorite: (serviceID: string) => void;
  removeFavorite: (serviceID: string) => void;
  toggleFavorite: (serviceID: string) => void;
  isFavorite: (serviceID: string) => boolean;
  refreshFavoriteServices: () => void;
};

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteService[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<ServiceEntity[]>([]);
  const [error, setError] = useState<string | null>(null);

  // L'initialisation depuis le localStorage est supprimée
  // useEffect(() => {
  //   const stored = localStorage.getItem('favorites');
  //   if (stored) {
  //     setFavorites(JSON.parse(stored));
  //   }
  // }, []);

  // À chaque modification des favoris, on les persiste dans le localStorage
  // et on rafraîchit la liste des services favoris
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    refreshFavoriteServices();
  }, [favorites]);

  const addFavorite = (serviceID: string) => {
    if (!favorites.find(fav => fav.serviceID === serviceID)) {
      const newFavorite = { serviceID, favoritedAt: new Date().toISOString() };
      setFavorites([...favorites, newFavorite]);
    }
  };

  const removeFavorite = (serviceID: string) => {
    setFavorites(favorites.filter(fav => fav.serviceID !== serviceID));
  };

  const toggleFavorite = (serviceID: string) => {
    if (favorites.find(fav => fav.serviceID === serviceID)) {
      removeFavorite(serviceID);
    } else {
      addFavorite(serviceID);
    }
  };

  const isFavorite = (serviceID: string) => {
    return favorites.some(fav => fav.serviceID === serviceID);
  };

  const refreshFavoriteServices = async () => {
    const serviceIDs = favorites.map(fav => fav.serviceID);
    if (serviceIDs.length > 0) {
      try {
        const services = await smpClient.service.getByIDs(serviceIDs);
        const servicesWithFavoriteDate = services.map((service: ServiceEntity) => {
          const fav = favorites.find(fav => fav.serviceID === service.serviceID);
          return { ...service, favoritedAt: fav?.favoritedAt };
        });
        setFavoriteServices(servicesWithFavoriteDate);
      } catch (err) {
        console.error("Error fetching favorite services:", err);
        setError("Erreur lors du chargement des services favoris.");
      }
    } else {
      setFavoriteServices([]);
    }
  };

  return (
    <FavoriteContext.Provider
      value={{ favorites, favoriteServices, addFavorite, removeFavorite, toggleFavorite, isFavorite, refreshFavoriteServices }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
};
