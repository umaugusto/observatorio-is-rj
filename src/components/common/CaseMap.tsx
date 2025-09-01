import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CasoInovacao } from '../../types';

// Fix para ícones do Leaflet no React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CaseMapProps {
  caso: CasoInovacao;
  className?: string;
}

const getLocationCoordinates = async (cep?: string, cidade?: string, estado?: string, bairro?: string): Promise<{ lat: number; lng: number } | null> => {
  // Prioridade 1: CEP específico
  if (cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      if (!data.erro) {
        // Usar Nominatim para buscar coordenadas do CEP
        const query = `${data.logradouro ? data.logradouro + ', ' : ''}${data.bairro}, ${data.localidade}, ${data.uf}, Brazil`;
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const nominatimData = await nominatimResponse.json();
        
        if (nominatimData && nominatimData.length > 0) {
          return {
            lat: parseFloat(nominatimData[0].lat),
            lng: parseFloat(nominatimData[0].lon)
          };
        }
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas via CEP:', error);
    }
  }
  
  // Prioridade 2: Bairro + Cidade + Estado
  if (bairro && cidade) {
    try {
      const query = `${bairro}, ${cidade}${estado ? `, ${estado}` : ''}, Brazil`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas via bairro:', error);
    }
  }
  
  // Prioridade 3: Apenas cidade
  if (cidade) {
    try {
      const query = `${cidade}${estado ? `, ${estado}` : ''}, Brazil`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas via cidade:', error);
    }
  }
  
  return null;
};

// Função para buscar os limites do bairro via Overpass API
const getNeighborhoodBoundary = async (bairro?: string, cidade?: string): Promise<any[]> => {
  if (!bairro || !cidade) return [];
  
  try {
    const query = `
      [out:json][timeout:25];
      (
        relation["place"~"neighbourhood|suburb"]["name"~"${bairro}",i]["addr:city"~"${cidade}",i];
        way["place"~"neighbourhood|suburb"]["name"~"${bairro}",i]["addr:city"~"${cidade}",i];
      );
      out geom;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
    const data = await response.json();
    
    if (data.elements && data.elements.length > 0) {
      return data.elements.map((element: any) => {
        if (element.geometry) {
          return element.geometry.map((point: any) => [point.lat, point.lon]);
        }
        return [];
      }).filter((coords: any[]) => coords.length > 0);
    }
  } catch (error) {
    console.error('Erro ao buscar limites do bairro:', error);
  }
  
  return [];
};

export const CaseMap = ({ caso, className = '' }: CaseMapProps) => {
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [neighborhoodBoundary, setNeighborhoodBoundary] = useState<any[]>([]);
  const [boundaryType, setBoundaryType] = useState<'polygon' | 'circle'>('circle');

  useEffect(() => {
    const loadMapData = async () => {
      let finalCoords: { lat: number; lng: number } | null = null;
      
      // Usar coordenadas já existentes se disponíveis
      if (caso.coordenadas_lat && caso.coordenadas_lng) {
        finalCoords = {
          lat: caso.coordenadas_lat,
          lng: caso.coordenadas_lng
        };
      } else {
        // Buscar coordenadas baseadas nos dados disponíveis
        finalCoords = await getLocationCoordinates(
          caso.cep,
          caso.cidade,
          caso.estado,
          caso.bairro
        );
        
        if (!finalCoords) {
          // Coordenadas padrão para Rio de Janeiro se não conseguir encontrar
          finalCoords = {
            lat: -22.9068,
            lng: -43.1729
          };
        }
      }
      
      setCoords(finalCoords);
      
      // Tentar buscar os limites do bairro se tivermos bairro e cidade
      if (caso.bairro && caso.cidade) {
        console.log('🗺️ Buscando limites do bairro:', caso.bairro, caso.cidade);
        const boundary = await getNeighborhoodBoundary(caso.bairro, caso.cidade);
        
        if (boundary && boundary.length > 0) {
          console.log('✅ Limites do bairro encontrados:', boundary.length, 'polígonos');
          setNeighborhoodBoundary(boundary);
          setBoundaryType('polygon');
        } else {
          console.log('⚠️ Limites do bairro não encontrados, usando círculo aproximado');
          setBoundaryType('circle');
        }
      } else {
        setBoundaryType('circle');
      }
      
      setLoading(false);
    };

    loadMapData();
  }, [caso]);

  const getLocationString = () => {
    if (caso.cidade) {
      const parts = [];
      if (caso.bairro) parts.push(caso.bairro);
      parts.push(caso.cidade);
      if (caso.estado) parts.push(caso.estado);
      return parts.join(', ');
    }
    return caso.localizacao || 'Localização não informada';
  };

  // Raio de fallback para quando não há delimitação do bairro
  const getFallbackRadius = (): number => {
    if (caso.pessoas_impactadas) {
      if (caso.pessoas_impactadas < 100) return 300;
      if (caso.pessoas_impactadas < 500) return 750;
      if (caso.pessoas_impactadas < 1000) return 1200;
      if (caso.pessoas_impactadas < 5000) return 2000;
      return 3000;
    }
    return 1000; // 1km default para bairros
  };

  if (loading || !coords) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Carregando mapa e delimitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={boundaryType === 'polygon' ? 13 : 14}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcador principal do caso */}
        <Marker position={[coords.lat, coords.lng]}>
          <Popup>
            <div className="text-center max-w-xs">
              <h3 className="font-bold text-base mb-2">{caso.titulo}</h3>
              <p className="text-sm text-gray-600 mb-2">{getLocationString()}</p>
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {caso.categoria}
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Delimitação do bairro ou círculo de fallback */}
        {boundaryType === 'polygon' && neighborhoodBoundary.length > 0 ? (
          // Polígonos do bairro real
          neighborhoodBoundary.map((boundary, index) => (
            <Polygon
              key={index}
              positions={boundary}
              color="#3B82F6"
              fillColor="#3B82F6"
              fillOpacity={0.15}
              weight={2}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold mb-1">Delimitação do Bairro</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {caso.bairro}
                  </p>
                  {caso.pessoas_impactadas && (
                    <p className="text-sm">
                      <strong>{caso.pessoas_impactadas.toLocaleString()}</strong> pessoas impactadas
                    </p>
                  )}
                </div>
              </Popup>
            </Polygon>
          ))
        ) : (
          // Círculo de fallback
          <Circle
            center={[coords.lat, coords.lng]}
            radius={getFallbackRadius()}
            color="#3B82F6"
            fillColor="#3B82F6"
            fillOpacity={0.1}
            weight={2}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold mb-1">Área Aproximada</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Raio estimado: {(getFallbackRadius() / 1000).toFixed(1)} km
                </p>
                {caso.pessoas_impactadas && (
                  <p className="text-sm">
                    <strong>{caso.pessoas_impactadas.toLocaleString()}</strong> pessoas impactadas
                  </p>
                )}
              </div>
            </Popup>
          </Circle>
        )}
      </MapContainer>
      
      {/* Legenda */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Local do projeto</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 border-2 border-blue-500 bg-blue-500/10 mr-2 ${boundaryType === 'polygon' ? 'rounded-sm' : 'rounded-full'}`}></div>
            <span>{boundaryType === 'polygon' ? 'Delimitação do bairro' : 'Área aproximada'}</span>
          </div>
        </div>
      </div>
      
      {/* Info box */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
        <h4 className="font-semibold text-sm mb-1">{getLocationString()}</h4>
        {caso.cep && (
          <p className="text-xs text-gray-500 font-mono mb-1">CEP: {caso.cep}</p>
        )}
        {caso.pessoas_impactadas && (
          <p className="text-xs text-gray-600">
            <strong>{caso.pessoas_impactadas.toLocaleString()}</strong> pessoas impactadas
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {boundaryType === 'polygon' ? 
            `Delimitação real do bairro` : 
            `Área estimada: ${(getFallbackRadius() / 1000).toFixed(1)} km de raio`
          }
        </p>
      </div>
    </div>
  );
};