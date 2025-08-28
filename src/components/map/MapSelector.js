import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMarker = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
  ) : null;
};

const MapSelector = ({ onLocationSelect, selectedLocation }) => {
  const { t } = useTranslation();
  const [mapCenter] = useState([36.8065, 10.1815]); // Tunis, Tunisia as default

  return (
    <div className="space-y-4">
      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker 
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
          />
        </MapContainer>
      </div>
      
      {selectedLocation && (
        <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <span className="font-medium">Selected location:</span> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('selectDestination')}
      </p>
    </div>
  );
};

export default MapSelector;
