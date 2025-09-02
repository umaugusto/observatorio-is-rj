import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCasos } from '../services/supabase';
import type { CasoInovacao } from '../types';
import { Link } from 'react-router-dom';

// Fix para ícones do Leaflet no React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CasoComCoordenadas extends CasoInovacao {
  coords?: { lat: number; lng: number };
  locationString?: string;
}

// Função para obter coordenadas de um caso
const getLocationCoordinates = async (caso: CasoInovacao): Promise<{ lat: number; lng: number } | null> => {
  // Se já tem coordenadas, use-as
  if (caso.coordenadas_lat && caso.coordenadas_lng) {
    return {
      lat: caso.coordenadas_lat,
      lng: caso.coordenadas_lng
    };
  }

  // Prioridade 1: CEP específico
  if (caso.cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${caso.cep.replace(/\D/g, '')}/json/`);
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
  if (caso.bairro && caso.cidade) {
    try {
      const query = `${caso.bairro}, ${caso.cidade}${caso.estado ? `, ${caso.estado}` : ''}, Brazil`;
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
  if (caso.cidade) {
    try {
      const query = `${caso.cidade}${caso.estado ? `, ${caso.estado}` : ''}, Brazil`;
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
  
  // Fallback: campo localizacao antigo
  if (caso.localizacao) {
    try {
      const query = `${caso.localizacao}, Rio de Janeiro, Brazil`;
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
      console.error('Erro ao buscar coordenadas via localizacao:', error);
    }
  }
  
  return null;
};

// Função para criar string de localização
const getLocationString = (caso: CasoInovacao): string => {
  if (caso.cidade) {
    const parts = [];
    if (caso.bairro) parts.push(caso.bairro);
    parts.push(caso.cidade);
    if (caso.estado) parts.push(caso.estado);
    return parts.join(', ');
  }
  return caso.localizacao || 'Localização não informada';
};

// Cores por categoria
const getCategoryColor = (categoria: string): string => {
  const colors: Record<string, string> = {
    'Educação': '#3B82F6',
    'Saúde': '#10B981',
    'Meio Ambiente': '#059669',
    'Cultura': '#8B5CF6',
    'Tecnologia': '#6366F1',
    'Empreendedorismo': '#F59E0B',
    'Inclusão Social': '#EF4444',
    'Urbanismo': '#6B7280',
    'Alimentação': '#F97316',
    'Esporte': '#84CC16',
  };
  return colors[categoria] || '#6B7280';
};

// Ícone customizado por categoria
const createCustomIcon = (categoria: string): L.DivIcon => {
  const color = getCategoryColor(categoria);
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">
        ${categoria.charAt(0)}
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5]
  });
};

export const Mapa = () => {
  const [casos, setCasos] = useState<CasoComCoordenadas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroCidade, setFiltroCidade] = useState<string>('');
  const [casosComCoordenadas, setCasosComCoordenadas] = useState<CasoComCoordenadas[]>([]);
  const [casosSemCoordenadas, setCasosSemCoordenadas] = useState<CasoComCoordenadas[]>([]);

  // Carregar casos do banco de dados
  useEffect(() => {
    const loadCasos = async () => {
      try {
        setLoading(true);
        console.log('🗺️ Carregando casos para o mapa...');
        const casosData = await getCasos();
        
        // Processar casos para obter coordenadas
        const casosProcessados: CasoComCoordenadas[] = [];
        const casosSemCoords: CasoComCoordenadas[] = [];
        
        for (const caso of casosData) {
          console.log(`🔍 Processando caso: ${caso.titulo}`);
          const coords = await getLocationCoordinates(caso);
          const locationString = getLocationString(caso);
          
          const casoProcessado: CasoComCoordenadas = {
            ...caso,
            coords,
            locationString
          };
          
          if (coords) {
            casosProcessados.push(casoProcessado);
            console.log(`✅ Coordenadas encontradas para: ${caso.titulo} - ${coords.lat}, ${coords.lng}`);
          } else {
            casosSemCoords.push(casoProcessado);
            console.log(`❌ Coordenadas não encontradas para: ${caso.titulo}`);
          }
        }
        
        setCasosComCoordenadas(casosProcessados);
        setCasosSemCoordenadas(casosSemCoords);
        setCasos([...casosProcessados, ...casosSemCoords]);
        
        console.log(`📊 Resumo: ${casosProcessados.length} casos com coordenadas, ${casosSemCoords.length} sem coordenadas`);
      } catch (error) {
        console.error('Erro ao carregar casos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCasos();
  }, []);

  // Filtrar casos
  const casosFiltrados = casos.filter(caso => {
    const passaCategoria = !filtroCategoria || caso.categoria === filtroCategoria;
    const passaCidade = !filtroCidade || caso.cidade === filtroCidade;
    return passaCategoria && passaCidade;
  });

  const casosParaMapa = casosFiltrados.filter(caso => caso.coords);
  
  // Extrair categorias e cidades únicas para os filtros
  const categorias = Array.from(new Set(casos.map(caso => caso.categoria))).sort();
  const cidades = Array.from(new Set(casos.map(caso => caso.cidade).filter(Boolean))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando Mapa</h2>
          <p className="text-gray-600">Obtendo localização dos casos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa de Casos</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore todos os casos de inovação social cadastrados no Observatório IS-RJ através do mapa interativo
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{casos.length}</div>
              <div className="text-sm opacity-90">Total de Casos</div>
            </div>
            <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{casosComCoordenadas.length}</div>
              <div className="text-sm opacity-90">No Mapa</div>
            </div>
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{categorias.length}</div>
              <div className="text-sm opacity-90">Categorias</div>
            </div>
            <div className="bg-gradient-to-r from-neutral-500 to-neutral-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{cidades.length}</div>
              <div className="text-sm opacity-90">Cidades</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-48">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas as Categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <select
                value={filtroCidade}
                onChange={(e) => setFiltroCidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas as Cidades</option>
                {cidades.map(cidade => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {casosParaMapa.length} de {casos.length} casos visíveis
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="h-[calc(100vh-280px)] relative">
        <MapContainer
          center={[-22.9068, -43.1729]} // Rio de Janeiro
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {casosParaMapa.map((caso) => (
              <Marker
                key={caso.id}
                position={[caso.coords!.lat, caso.coords!.lng]}
                icon={createCustomIcon(caso.categoria)}
              >
                <Popup maxWidth={300}>
                  <div className="text-center max-w-xs">
                    <h3 className="font-bold text-base mb-2 line-clamp-2">{caso.titulo}</h3>
                    
                    {caso.imagem_url && (
                      <div className="mb-3">
                        <img
                          src={caso.imagem_url}
                          alt={caso.titulo}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="text-left space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Categoria:</span>
                        <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                          {caso.categoria}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Local:</span>
                        <span className="text-xs text-gray-700">{caso.locationString}</span>
                      </div>
                      
                      {caso.pessoas_impactadas && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">Impacto:</span>
                          <span className="text-xs font-semibold text-secondary-600">
                            {caso.pessoas_impactadas.toLocaleString()} pessoas
                          </span>
                        </div>
                      )}
                      
                      {caso.resumo && (
                        <p className="text-xs text-gray-600 line-clamp-3 mt-2">
                          {caso.resumo}
                        </p>
                      )}
                    </div>
                    
                    <Link
                      to={`/caso/${caso.id}`}
                      className="btn-primary text-xs py-2 px-4 inline-block w-full text-center"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Legenda */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
          <h4 className="font-semibold text-sm mb-3">Legenda</h4>
          <div className="space-y-2 text-xs">
            {categorias.slice(0, 6).map(categoria => (
              <div key={categoria} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: getCategoryColor(categoria) }}
                ></div>
                <span>{categoria}</span>
              </div>
            ))}
            {categorias.length > 6 && (
              <div className="text-gray-500 text-xs mt-1">
                + {categorias.length - 6} outras categorias
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Casos sem coordenadas */}
      {casosSemCoordenadas.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{casosSemCoordenadas.length} casos</strong> não aparecem no mapa por falta de informação de localização (CEP, cidade ou coordenadas).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};