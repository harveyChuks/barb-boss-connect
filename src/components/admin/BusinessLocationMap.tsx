import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Building2 } from "lucide-react";

interface Business {
  id: string;
  name: string;
  business_type: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

const BusinessLocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMapboxToken();
    fetchBusinessLocations();
  }, []);

  const fetchMapboxToken = async () => {
    try {
      // Try to get Mapbox token from Supabase secrets
      // For now, we'll use a placeholder - user should add this as a secret
      const token = process.env.MAPBOX_PUBLIC_TOKEN || '';
      if (!token) {
        console.warn('Mapbox token not found. Please add MAPBOX_PUBLIC_TOKEN to your Supabase Edge Function secrets.');
      }
      setMapboxToken(token);
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
    }
  };

  const fetchBusinessLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, business_type, city, state, country, latitude, longitude, is_active')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      console.log('Businesses with locations:', data);
      setBusinesses(data || []);
    } catch (error: any) {
      console.error('Error fetching business locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch business locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || businesses.length === 0) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 2,
      center: [0, 20],
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for each business
    const bounds = new mapboxgl.LngLatBounds();

    businesses.forEach((business) => {
      if (business.latitude && business.longitude) {
        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'business-marker';
        markerElement.style.cssText = `
          width: 32px;
          height: 32px;
          background-color: ${business.is_active ? '#10b981' : '#6b7280'};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Add building icon
        const icon = document.createElement('div');
        icon.innerHTML = '🏢';
        icon.style.fontSize = '14px';
        markerElement.appendChild(icon);

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${business.name}</h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: capitalize;">
              ${business.business_type.replace('_', ' ')}
            </p>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">
              📍 ${business.city}, ${business.state}, ${business.country}
            </p>
            <div style="margin-top: 8px;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; 
                background-color: ${business.is_active ? '#d1fae5' : '#f3f4f6'}; 
                color: ${business.is_active ? '#065f46' : '#6b7280'};">
                ${business.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(markerElement)
          .setLngLat([business.longitude, business.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        // Extend bounds
        bounds.extend([business.longitude, business.latitude]);
      }
    });

    // Fit map to show all markers
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10
      });
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [businesses, mapboxToken]);

  if (!mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Business Locations Map
          </CardTitle>
          <CardDescription>
            To display the map, please add your Mapbox public token to your Supabase Edge Function secrets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Map requires Mapbox token</p>
            </div>
            <div className="text-sm space-y-2">
              <p><strong>Steps to set up:</strong></p>
              <ol className="text-left max-w-md mx-auto space-y-1">
                <li>1. Get your Mapbox public token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
                <li>2. Add it as "MAPBOX_PUBLIC_TOKEN" in Supabase Edge Function secrets</li>
                <li>3. Refresh this page</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Business Locations Map
        </CardTitle>
        <CardDescription>
          Geographic distribution of registered businesses ({businesses.length} locations)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-muted-foreground">Loading business locations...</div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No businesses with location data found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active ({businesses.filter(b => b.is_active).length})
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                Inactive ({businesses.filter(b => !b.is_active).length})
              </Badge>
            </div>
            <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessLocationMap;