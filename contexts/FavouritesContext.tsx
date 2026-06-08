import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../constants/data';

interface FavouritesContextType {
  favourites: Product[];
  toggleFavourite: (product: Product) => void;
  isFavourite: (id: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<Product[]>([]);

  function toggleFavourite(product: Product) {
    setFavourites((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, { ...product, saved: true }],
    );
  }

  function isFavourite(id: string) {
    return favourites.some((p) => p.id === id);
  }

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites(): FavouritesContextType {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
