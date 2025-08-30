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
    // Hier komt de logica om met de Pexels API te praten
    // 1. Zet isLoading op true en reset de error state
    // 2. Bouw de volledige URL met de zoekopdracht (e.g., `?query=nature&per_page=1`)
    // 3. Gebruik de `fetch` API om de data op te halen
    // 4. Belangrijk: Voeg de API sleutel toe in de `headers` van de request
    // 5. Verwerk het antwoord (response.json())
    // 6. Sla de resultaten op in de `photos` state
    // 7. Vang eventuele fouten af en sla ze op in de `error` state
    // 8. Zet isLoading weer op false
  }, []);

  return { photos, isLoading, error, searchPhotos };
}