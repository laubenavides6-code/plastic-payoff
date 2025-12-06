import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Map, X, Search } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = "pk.eyJ1IjoibWF0ZW8xMjIiLCJhIjoiY21pcTNqYTlmMGMxZTNlcHdhMnhmczFwdiJ9.8C4efXzPA1KALooo2ZmP4w";

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
}

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

export default function AddressInput({ value, onChange }: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions from Mapbox Geocoding API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=co&language=es&types=address,poi`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(suggestion.place_name);
    onChange(suggestion.place_name);
    setSelectedCoords(suggestion.center);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setInputValue(address);
        onChange(address);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Default to Bogotá coordinates
    const defaultCenter: [number, number] = selectedCoords || [-74.0721, 4.7110];

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v13",
      center: defaultCenter,
      zoom: 15,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker
    markerRef.current = new mapboxgl.Marker({ draggable: true, color: "#22c55e" })
      .setLngLat(defaultCenter)
      .addTo(mapRef.current);

    // Handle marker drag
    markerRef.current.on("dragend", () => {
      const lngLat = markerRef.current?.getLngLat();
      if (lngLat) {
        setSelectedCoords([lngLat.lng, lngLat.lat]);
        reverseGeocode(lngLat.lng, lngLat.lat);
      }
    });

    // Handle map click
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current?.setLngLat([lng, lat]);
      setSelectedCoords([lng, lat]);
      reverseGeocode(lng, lat);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [showMap]);

  // Update marker position when coords change
  useEffect(() => {
    if (selectedCoords && markerRef.current && mapRef.current) {
      markerRef.current.setLngLat(selectedCoords);
      mapRef.current.flyTo({ center: selectedCoords, zoom: 16 });
    }
  }, [selectedCoords]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-3">
      {/* Address input with autocomplete */}
      <div className="relative" ref={inputRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Escribe tu dirección..."
            className="eco-input pl-10 pr-4"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3 border-b border-border/50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{suggestion.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map toggle button */}
      <button
        type="button"
        onClick={() => setShowMap(!showMap)}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors",
          showMap
            ? "bg-primary/10 border-primary text-primary"
            : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
        )}
      >
        <Map className="w-4 h-4" />
        <span className="text-sm font-medium">
          {showMap ? "Ocultar mapa" : "Seleccionar en el mapa"}
        </span>
      </button>

      {/* Map container */}
      {showMap && (
        <div className="relative animate-fade-up">
          <div
            ref={mapContainerRef}
            className="w-full h-64 rounded-xl overflow-hidden border border-border"
          />
          <button
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 p-1.5 bg-background/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-background transition-colors z-10"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Toca el mapa o arrastra el marcador para seleccionar la ubicación
          </p>
        </div>
      )}
    </div>
  );
}
