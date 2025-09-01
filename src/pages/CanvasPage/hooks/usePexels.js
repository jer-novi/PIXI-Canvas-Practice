// src/pages/CanvasPage/hooks/usePexels.js
import { useState, useCallback, useEffect } from "react"; // <-- useEffect importeren
import axios from "axios";

// Haal de API sleutel op uit de .env.local file
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const COLLECTION_ID = import.meta.env.VITE_PEXELS_COLLECTION_ID; // <-- Nieuwe environment variable
const SEARCH_URL = "https://api.pexels.com/v1/search";
const COLLECTION_URL = `https://api.pexels.com/v1/collections/${COLLECTION_ID}`;

export function usePexels() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(""); // Fix: Add missing state

  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);

  // --- ENHANCED HULPFUNCTIE VOOR DATA OPHALEN ---
  // We maken een generieke functie om dubbele code te voorkomen met uitgebreide logging
  const fetchPexelsData = useCallback(async (url, isCollection = false) => {
    console.log('🚀 Starting API request:', { url, isCollection });
    
    setIsLoading(true);
    setError(null);

    // API Key validatie
    if (!API_KEY) {
      console.error('❌ API_KEY missing');
      setError("Pexels API sleutel ontbreekt. Voeg VITE_PEXELS_API_KEY toe aan je .env.local bestand.");
      setIsLoading(false);
      return;
    }
    
    console.log('🔑 API Key present (first 10 chars):', API_KEY?.substring(0, 10) + '...');

    try {
      console.log('📡 Making request to:', url);
      console.log('🔐 Headers:', { Authorization: API_KEY });
      
      const response = await axios.get(url, {
        headers: {
          Authorization: API_KEY,
        },
      });
      
      console.log('✅ API Response received:', {
        status: response.status,
        statusText: response.statusText,
        dataKeys: Object.keys(response.data),
        totalResults: response.data.total_results,
        page: response.data.page,
        perPage: response.data.per_page
      });
      
      // Data extraction met defensieve checks
      const photosData = isCollection ? response.data.media : response.data.photos;
      
      if (!photosData) {
        console.error('❌ No photos data in response structure:', response.data);
        setError(`Onverwachte API response structuur. Expected ${isCollection ? 'media' : 'photos'} array.`);
        setIsLoading(false);
        return;
      }
      
      console.log('📸 Photos extracted:', {
        count: photosData.length,
        firstPhotoId: photosData[0]?.id
      });
      
      setPhotos(photosData);
      setNextPageUrl(response.data.next_page || null);
      setPrevPageUrl(response.data.prev_page || null);

      console.log("🔍 Pexels API Response Summary:", {
        total_results: response.data.total_results,
        page: response.data.page,
        per_page: response.data.per_page,
        next_page: response.data.next_page,
        prev_page: response.data.prev_page,
        photos_count: photosData?.length,
        media_count: response.data.media?.length
      });
    } catch (err) {
      console.error('💥 API Error Details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: url
      });
      
      if (err.response?.status === 401) {
        setError("API sleutel ongeldig. Controleer VITE_PEXELS_API_KEY in je .env.local bestand.");
      } else if (err.response?.status === 429) {
        setError("API rate limit bereikt. Probeer later opnieuw.");
      } else {
        setError(`API fout: ${err.response?.status || err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCollectionPhotos = useCallback(() => {
    if (!COLLECTION_ID) {
      setError("Pexels Collectie ID ontbreekt.");
      return;
    }
    const collectionUrl = `${COLLECTION_URL}?per_page=15`;
    fetchPexelsData(collectionUrl, true); // `true` geeft aan dat het een collectie is
  }, [fetchPexelsData]);

  // --- AANGEPASTE SEARCH FUNCTIE ---
  // Deze doet nu alleen de EERSTE zoekopdracht

  const searchPhotos = useCallback(
    async (query) => {
      setCurrentQuery(query); /// Onthoud de zoekopdracht
      const initialUrl = `${SEARCH_URL}?query=${encodeURIComponent(
        query
      )}&per_page=15&orientation=landscape`;
      fetchPexelsData(initialUrl);
    },
    [fetchPexelsData]
  );

  // --- NIEUWE NAVIGATIE FUNCTIES ---
  const goToNextPage = useCallback(async () => {
    console.log("🔄 goToNextPage called, nextPageUrl:", nextPageUrl);
    if (nextPageUrl) {
      console.log("📡 Fetching next page:", nextPageUrl);
      fetchPexelsData(nextPageUrl);
    } else {
      console.log("❌ No nextPageUrl available");
    }
  }, [nextPageUrl, fetchPexelsData]);

  const goToPrevPage = useCallback(async () => {
    if (prevPageUrl) {
      fetchPexelsData(prevPageUrl);
    }
  }, [prevPageUrl, fetchPexelsData]);

  // Initialization logging
  useEffect(() => {
    console.log('🎬 usePexels Hook Initialized:', {
      API_KEY: API_KEY ? 'Present ✅' : 'Missing ❌',
      COLLECTION_ID: COLLECTION_ID ? 'Present ✅' : 'Missing ❌',
      SEARCH_URL,
      COLLECTION_URL
    });
  }, []);

  // Effect om de collectie automatisch te laden bij het initialiseren van de hook
  useEffect(() => {
    getCollectionPhotos();
  }, [getCollectionPhotos]);

  return {
    photos,
    isLoading,
    error,
    currentQuery, // Export current search query
    searchPhotos,
    getCollectionPhotos,
    goToNextPage,
    goToPrevPage,
    hasNextPage: !!nextPageUrl, // <-- Handige booleans voor de UI
    hasPrevPage: !!prevPageUrl, // <-- Handige booleans voor de UI
  };
}
