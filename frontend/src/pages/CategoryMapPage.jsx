import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const CategoryMapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useAuth();
  
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); // Kathmandu, Nepal
  const [mapZoom, setMapZoom] = useState(14);
  
  // Get category from navigation state
  const category = location.state?.category || 'All Categories';
  
  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);
          setMapCenter(userPos);
          setIsLoading(false);
        },
        (error) => {
          console.log('Geolocation permission denied or error:', error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  // Handle zoom in
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 19)); // Max zoom 19
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 3)); // Min zoom 3
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Simple search simulation - move map slightly
      const searchLocation = [
        mapCenter[0] + (Math.random() - 0.5) * 0.01,
        mapCenter[1] + (Math.random() - 0.5) * 0.01
      ];
      setMapCenter(searchLocation);
    }
  };
  
  // Handle sign in
  const handleSignIn = () => {
    navigate('/login');
  };
  
  // Sample data sources
  const dataSources = [
    { name: 'Local Shops', count: 156, active: true },
    { name: 'Online Partners', count: 89, active: false },
    { name: 'Community Posts', count: 234, active: true }
  ];
  
  // Custom marker for user location
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map Container */}
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ width: '100%', height: '100%' }}
        className="z-0"
        maxZoom={19}
        minZoom={3}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
      >
        {/* CLEAN DARK THEME - CartoDB Dark Matter (No Buildings, Max Zoom 19) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        
        {/* Map Center Change Handler */}
        <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
      </MapContainer>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading dark map...</p>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <div className="absolute left-4 top-4 bottom-4 w-80 bg-gray-900 rounded-xl shadow-2xl z-10 flex flex-col backdrop-blur-sm bg-gray-900/95">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-2">{category}</h2>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="w-full px-4 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
        
        {/* Data Sources */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Available Data Sources</h3>
          <div className="space-y-3">
            {dataSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${source.active ? 'bg-green-400' : 'bg-gray-600}'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{source.name}</p>
                    <p className="text-xs text-gray-400">{source.count} items</p>
                  </div>
                </div>
                <button
                  onClick={() => console.log(`Toggle ${source.name}`)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    source.active 
                      ? 'bg-blue-600 text-blue-100 hover:bg-blue-700' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {source.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Location Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center text-sm text-gray-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Your location detected</span>
          </div>
        </div>
      </div>
      
      {/* Sign In Button - Top Right */}
      {!isSignedIn && (
        <button
          onClick={handleSignIn}
          className="absolute top-4 right-4 z-20 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
        >
          Sign In
        </button>
      )}
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={() => userLocation && setMapCenter(userLocation)}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!userLocation}
          title="Center on Location"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Component to update map center and zoom when state changes
const MapCenterUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

export default CategoryMapPage;