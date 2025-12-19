import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Coordenadas aproximadas para cidades principais do RJ (Mock para visualização)
// Numa implementação real, usaríamos um serviço de Geocoding no backend ou frontend.
const cityCoords: { [key: string]: [number, number] } = {
  'Rio de Janeiro': [-22.9068, -43.1729],
  'Niterói': [-22.8859, -43.1153],
  'São Gonçalo': [-22.8275, -43.0632],
  'Duque de Caxias': [-22.7797, -43.3074],
  'Nova Iguaçu': [-22.7561, -43.4607],
  // Fallback
  'Unknown': [-22.9068, -43.1729] 
};

const SalesHeatmapWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  return (
    <Card sx={{ height: '400px' }}>
      <CardContent sx={{ height: '100%', p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="h6" sx={{ p: 2, position: 'absolute', zIndex: 1000, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
          {t('sales_heatmap')}
        </Typography>
        <MapContainer center={[-22.9068, -43.1729]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((cityData, index) => {
            const coords = cityCoords[cityData.city] || cityCoords['Unknown'];
            const radius = Math.log(cityData.total_revenue) * 2; // Scale radius based on revenue
            
            return (
              <CircleMarker 
                key={index} 
                center={coords} 
                radius={radius}
                pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.5 }}
              >
                <Popup>
                  <strong>{cityData.city}</strong><br />
                  Vendas: {cityData.sales_count}<br />
                  Receita: R$ {cityData.total_revenue.toFixed(2)}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default SalesHeatmapWidget;
