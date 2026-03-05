import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Cars.css';
import { FilterIcon } from './Icons';

const Cars = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    models: [],
    colors: [],
    fuelTypes: [],
    locations: [],
    priceRange: { min: 0, max: 10000000 },
    yearRange: { min: 2000, max: new Date().getFullYear() },
    kmRange: { min: 0, max: 200000 }
  });

  const [filters, setFilters] = useState({
    brand: [],
    model: [],
    color: [],
    fuelType: [],
    owners: [],
    location: [],
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: '',
    kmMin: '',
    kmMax: ''
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cars/filters');
      const data = await response.json();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Handle array filters
      ['brand', 'model', 'color', 'fuelType', 'owners', 'location'].forEach(key => {
        if (filters[key].length > 0) {
          queryParams.append(key, filters[key].join(','));
        }
      });

      // Handle range filters
      if (filters.priceMin) queryParams.append('priceMin', filters.priceMin);
      if (filters.priceMax) queryParams.append('priceMax', filters.priceMax);
      if (filters.yearMin) queryParams.append('yearMin', filters.yearMin);
      if (filters.yearMax) queryParams.append('yearMax', filters.yearMax);
      if (filters.kmMin) queryParams.append('kmMin', filters.kmMin);
      if (filters.kmMax) queryParams.append('kmMax', filters.kmMax);

      const response = await fetch(`http://localhost:5000/api/cars?${queryParams.toString()}`);
      const data = await response.json();
      if (data.success) {
        setCars(data.data);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      brand: [],
      model: [],
      color: [],
      fuelType: [],
      owners: [],
      location: [],
      priceMin: '',
      priceMax: '',
      yearMin: '',
      yearMax: '',
      kmMin: '',
      kmMax: ''
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'new': return <span className="car-badge badge-new">{t('newArrival') || 'New Arrival'}</span>;
        case 'hot': return <span className="car-badge badge-hot">{t('hotDeal') || 'Hot Deal'}</span>;
        case 'sold': return <span className="car-badge badge-sold">{t('sold') || 'Sold'}</span>;
        case 'booked': return <span className="car-badge badge-booked">{t('booked') || 'Booked'}</span>;
        default: return null;
    }
  };

  return (
    <div className="cars-page-container">
      <div className="cars-content-wrapper">
        
        {/* Filter Sidebar - Left Side (25%) */}
        <aside className="filters-sidebar">
          <div className="filter-header">
            <h3 className="filter-title">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FilterIcon className="icon-svg" fill="currentColor" />
                <span>{t('filters') || 'Filters'}</span>
              </span>
            </h3>
            <button className="reset-link" onClick={clearFilters}>{t('reset') || 'Reset'}</button>
          </div>
          
          {/* Budget Filter */}
          <div className="filter-section">
            <label className="filter-label">{t('budget') || 'Budget'}</label>
            <div className="range-inputs">
              <input 
                type="number" 
                name="priceMin" 
                placeholder="Min" 
                value={filters.priceMin} 
                onChange={handleInputChange} 
                className="range-input"
              />
              <span className="range-separator">-</span>
              <input 
                type="number" 
                name="priceMax" 
                placeholder="Max" 
                value={filters.priceMax} 
                onChange={handleInputChange} 
                className="range-input"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="filter-section">
            <label className="filter-label">{t('brand') || 'Brand'}</label>
            <div className="checkbox-group">
              {filterOptions.brands.map(item => (
                <label key={item.value} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filters.brand.includes(item.value)}
                    onChange={() => handleCheckboxChange('brand', item.value)}
                  />
                  <span>{item.value} ({item.count})</span>
                </label>
              ))}
            </div>
          </div>

           {/* Fuel Type Filter */}
           <div className="filter-section">
            <label className="filter-label">{t('fuelType') || 'Fuel Type'}</label>
            <div className="checkbox-group">
              {filterOptions.fuelTypes.map(item => (
                <label key={item.value} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={filters.fuelType.includes(item.value)}
                    onChange={() => handleCheckboxChange('fuelType', item.value)}
                  />
                  <span>{item.value} ({item.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div className="filter-section">
            <label className="filter-label">{t('year') || 'Year'}</label>
            <div className="range-inputs">
              <input 
                type="number" 
                name="yearMin" 
                placeholder="From" 
                value={filters.yearMin} 
                onChange={handleInputChange} 
                className="range-input"
              />
              <span className="range-separator">-</span>
              <input 
                type="number" 
                name="yearMax" 
                placeholder="To" 
                value={filters.yearMax} 
                onChange={handleInputChange} 
                className="range-input"
              />
            </div>
          </div>

          {/* Kilometers Filter */}
          <div className="filter-section">
            <label className="filter-label">{t('kilometers') || 'Kilometers'}</label>
            <div className="range-inputs">
              <input 
                type="number" 
                name="kmMin" 
                placeholder="Min" 
                value={filters.kmMin} 
                onChange={handleInputChange} 
                className="range-input"
              />
              <span className="range-separator">-</span>
              <input 
                type="number" 
                name="kmMax" 
                placeholder="Max" 
                value={filters.kmMax} 
                onChange={handleInputChange} 
                className="range-input"
              />
            </div>
          </div>
        </aside>

        {/* Cars Grid - Right Side (75%) */}
        <main className="cars-grid-container">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div className="cars-grid">
              {cars.length > 0 ? (
                cars.map(car => (
                  <div 
                    key={car._id} 
                    className={`car-card ${car.status === 'booked' ? 'booked-blur' : ''}`} 
                    onClick={() => navigate(`/cars/${car._id}`)}
                  >
                    <div className="car-image-container">
                      <img 
                        src={car.primaryImage ? `http://localhost:5000/${car.primaryImage}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
                        alt={`${car.brand} ${car.model}`} 
                        className="car-image"
                        loading="lazy"
                      />
                      {getStatusBadge(car.status)}
                    </div>
                    <div className="car-details">
                      <h3 className="car-title">{car.brand} {car.model}</h3>
                      <div className="car-price">{formatPrice(car.price)}</div>
                      <button 
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cars/${car._id}`);
                        }}
                      >
                        {t('viewDetails') || 'View Details'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results-container">
                    <div className="no-results-content">
                        <div className="no-results-icon">🚗🔍</div>
                        <h3>{t('noCarsFound') || 'No cars found matching your search'}</h3>
                        <p>{t('tryAdjustingFilters') || 'Try adjusting filters or searching with a different keyword'}</p>
                        <div className="no-results-actions">
                            <button className="clear-search-btn" onClick={() => {
                                clearFilters();
                                navigate('/cars');
                            }}>
                                {t('clearSearch') || 'Clear Search'}
                            </button>
                        </div>
                    </div>
                </div>
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Cars;
