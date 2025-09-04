// src/pages/CanvasPage/hooks/usePexels.js
import {useState, useCallback, useEffect, useRef} from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const COLLECTION_ID = import.meta.env.VITE_PEXELS_COLLECTION_ID;
const SEARCH_URL = "https://api.pexels.com/v1/search";
const COLLECTION_URL = `https://api.pexels.com/v1/collections/${COLLECTION_ID}`;

export function usePexels() {
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuery, setCurrentQuery] = useState("");
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);

    // --- NIEUW: Vlag om te zorgen dat de collectie maar één keer laadt ---
    const collectionLoadedRef = useRef(false);

    const fetchPexelsData = useCallback(async (url, isCollection = false) => {
        setIsLoading(true);
        setError(null);

        if (!API_KEY) {
            setError("Pexels API sleutel ontbreekt.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(url, {
                headers: {Authorization: API_KEY},
            });

            const photosData = isCollection ? response.data.media : response.data.photos;

            if (!photosData) {
                setError(`Onverwachte API response structuur. Expected ${isCollection ? 'media' : 'photos'} array.`);
                setIsLoading(false);
                return;
            }

            setPhotos(photosData);
            setNextPageUrl(response.data.next_page || null);
            setPrevPageUrl(response.data.prev_page || null);

            // Als de collectie succesvol is geladen, zet de vlag.
            if (isCollection) {
                collectionLoadedRef.current = true;
            }

        } catch (err) {
            setError(`API fout: ${err.response?.status || err.message}`);
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
        fetchPexelsData(collectionUrl, true);
    }, [fetchPexelsData]);

    const searchPhotos = useCallback(
        (query) => {
            setCurrentQuery(query);
            const initialUrl = `${SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
            fetchPexelsData(initialUrl);
        },
        [fetchPexelsData]
    );

    const goToNextPage = useCallback(() => {
        if (nextPageUrl) {
            fetchPexelsData(nextPageUrl);
        }
    }, [nextPageUrl, fetchPexelsData]);

    const goToPrevPage = useCallback(() => {
        if (prevPageUrl) {
            fetchPexelsData(prevPageUrl);
        }
    }, [prevPageUrl, fetchPexelsData]);

    useEffect(() => {
        // Laad de collectie alleen als deze nog NIET geladen is.
        if (!collectionLoadedRef.current) {
            getCollectionPhotos();
        }
    }, [getCollectionPhotos]);

    return {
        photos,
        isLoading,
        error,
        currentQuery,
        searchPhotos,
        getCollectionPhotos,
        goToNextPage,
        goToPrevPage,
        hasNextPage: !!nextPageUrl,
        hasPrevPage: !!prevPageUrl,
    };
}