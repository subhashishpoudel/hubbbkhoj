import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
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

const CategoryMapPageScrollable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const category = location.state?.category || 'Local Businesses';
  
  // Map states
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Mumbai coordinates
  const [mapZoom, setMapZoom] = useState(14);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [sortByRating, setSortByRating] = useState('desc');
  
  // Sample markers for the selected category
  const [allMarkers] = useState([
    { id: 1, name: 'TechZone Electronics', position: [19.0760, 72.8777], rating: 4.8, category: 'Electronics', products: ['iPhone 14', 'Samsung TV', 'Laptop Dell'] },
    { id: 2, name: 'Green Leaf Restaurant', position: [19.0860, 72.8877], rating: 4.6, category: 'Food', products: ['Pizza Margherita', 'Burger Combo', 'Pasta Alfredo'] },
    { id: 3, name: 'QuickFix Auto Service', position: [19.0660, 72.8677], rating: 4.7, category: 'Automobile', products: ['Oil Change', 'Brake Repair', 'Tire Rotation'] },
    { id: 4, name: 'Serenity Spa', position: [19.0960, 72.8977], rating: 4.9, category: 'Health', products: ['Massage Therapy', 'Facial Treatment', 'Aromatherapy'] },
    { id: 5, name: 'Book Haven Store', position: [19.0560, 72.8577], rating: 4.5, category: 'Books', products: ['Fiction Novels', 'Study Guides', 'Magazines'] },
    { id: 6, name: 'Fitness Plus Gym', position: [19.1060, 72.9077], rating: 4.4, category: 'Fitness', products: ['Personal Training', 'Yoga Classes', 'Protein Supplements'] }
  ]);

  // Filter and sort markers
  const filteredMarkers = allMarkers.filter(marker => {
    // Product search filter
    const matchesProduct = !productSearch || 
      marker.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      marker.products.some(product => product.toLowerCase().includes(productSearch.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategory === 'All' || marker.category === selectedCategory;
    
    // Rating filter
    const matchesRating = marker.rating >= minRating;
    
    // Distance filter (simplified - within range)
    const distance = Math.random() * 20; // Simplified distance calculation
    const matchesDistance = distance <= distanceFilter;
    
    return matchesProduct && matchesCategory && matchesRating && matchesDistance;
  }).sort((a, b) => {
    if (sortByRating === 'desc') return b.rating - a.rating;
    return a.rating - b.rating;
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);
          setMapCenter(userPos);
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);
          setMapCenter(userPos);
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 19));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 3));
  };

  // Custom marker for user location
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Map Section - Full Screen */}
      <div className="relative w-full h-full">
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
          {/* DARK THEME - CartoDB Dark Matter (No Buildings, Max Zoom 19) */}
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
          
          {/* Category Markers */}
          {filteredMarkers.map(marker => (
            <Marker key={marker.id} position={marker.position}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{marker.name}</h3>
                  <p className="text-gray-600">{marker.category}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 font-semibold">{marker.rating}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Map Center Updater */}
          <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
        </MapContainer>
        
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
          
          {/* Product Search */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Search Products</h3>
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Category</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Food">Food</option>
              <option value="Automobile">Automobile</option>
              <option value="Health">Health</option>
              <option value="Books">Books</option>
              <option value="Fitness">Fitness</option>
            </select>
          </div>
          
          {/* Distance Filter */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Distance (km)</h3>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="50"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-300 w-12">{distanceFilter}km</span>
            </div>
          </div>
          
          {/* Rating Filter */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Minimum Rating</h3>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    minRating === rating
                      ? 'bg-blue-600 text-blue-100'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}★`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sort by Rating */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Sort by Rating</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortByRating('desc')}
                className={`px-3 py-1 text-xs rounded-full ${
                  sortByRating === 'desc'
                    ? 'bg-blue-600 text-blue-100'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Highest First
              </button>
              <button
                onClick={() => setSortByRating('asc')}
                className={`px-3 py-1 text-xs rounded-full ${
                  sortByRating === 'asc'
                    ? 'bg-blue-600 text-blue-100'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Lowest First
              </button>
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
        <SignedOut>
          <button
            onClick={handleSignIn}
            className="absolute top-4 right-4 z-20 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
          >
            Sign In
          </button>
        </SignedOut>
        
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
            onClick={handleLocationClick}
            className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Center on Location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
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

export default CategoryMapPageScrollable;