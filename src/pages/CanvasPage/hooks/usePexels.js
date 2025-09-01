// src/pages/CanvasPage/hooks/usePexels.js
import { useState, useCallback } from 'react';
import axios from 'axios'; // <-- Importeer axios

// Haal de API sleutel op uit de .env.local file
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const API_URL = 'https://api.pexels.com/v1/search';

export function usePexels() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPhotos = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);
    setPhotos([]);

    if (!API_KEY) {
      setError("Pexels API sleutel ontbreekt. Voeg VITE_PEXELS_API_KEY toe aan je .env.local bestand.");
      setIsLoading(false);
      return;
    }

    try {
      const url = `${API_URL}?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': API_KEY
        }
      });
      setPhotos(response.data.photos);
    } catch (err) {
      console.error("Fout bij het ophalen van Pexels data:", err);
      setError('Er is iets misgegaan bij het zoeken naar foto\'s.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { photos, isLoading, error, searchPhotos };
}