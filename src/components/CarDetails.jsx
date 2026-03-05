import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './CarDetails.css';
import './Cars.css'; // Reuse card styles for related cars

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth(); // Assuming auth context provides user info
  
  const [car, setCar] = useState(null);
  const [relatedCars, setRelatedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    visitDate: ''
  });

  useEffect(() => {
    fetchCarDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/${imagePath}`;
  };

  const fetchCarDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/cars/${id}`);
      const data = await response.json();
      if (data.success) {
        setCar(data.data);
        setRelatedCars(data.related || []);
        if (data.data.images && data.data.images.length > 0) {
            setActiveImage(data.data.images[0]);
        } else if (data.data.primaryImage) {
            setActiveImage(data.data.primaryImage);
        }
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                carId: car._id,
                userId: user ? user._id : null,
                customerName: bookingData.name,
                customerEmail: bookingData.email,
                customerPhone: bookingData.phone,
                visitDate: bookingData.visitDate
            })
        });
        const data = await response.json();
        if (data.success) {
            alert(t('bookingSuccess') || 'Booking request sent successfully!');
            setShowBookingModal(false);
        } else {
            alert(t('bookingError') || 'Failed to book. Please try again.');
        }
    } catch (error) {
        console.error('Error booking car:', error);
    }
  };

  const handleInputChange = (e) => {
      setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const addToWishlist = async () => {
      if (!user) {
          alert(t('loginRequired') || 'Please login to add to wishlist');
          return;
      }
      // API call to add to wishlist
      try {
          const res = await fetch('http://localhost:5000/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user._id, carId: car._id })
          });
          const data = await res.json();
          if (data.success) alert(t('addedToWishlist') || 'Added to Wishlist');
          else alert(data.message);
      } catch (err) {
          console.error(err);
      }
  };

  if (loading) {
      return (
          <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading details...</p>
          </div>
      );
  }

  if (!car) {
      return <div className="error-container">Car not found</div>;
  }

  return (
    <div className="car-details-container">
      <div className="details-wrapper">
        
        {/* Breadcrumb */}
        <div className="breadcrumb">
            <span onClick={() => navigate('/')}>Home</span> &gt; 
            <span onClick={() => navigate('/cars')}>Cars</span> &gt; 
            <span className="current">{car.brand} {car.model}</span>
        </div>

        <div className="details-main-content">
            {/* Left Column: Images */}
            <div className="gallery-section">
                <div className="main-image-container">
                    <img src={getImageUrl(activeImage) || 'https://via.placeholder.com/600x400?text=No+Image'} alt={car.model} className="main-image" />
                    <div className={`status-badge-large ${car.status}`}>{car.status}</div>
                </div>
                {car.images && car.images.length > 1 && (
                    <div className="thumbnail-list">
                        {car.images.map((img, index) => (
                            <img 
                                key={index} 
                                src={getImageUrl(img)} 
                                alt={`View ${index + 1}`} 
                                className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                                onClick={() => setActiveImage(img)}
                            />
                        ))}
                    </div>
                )}
                
                {/* Specifications Section (Moved here for better flow on mobile/tablet) */}
                <div className="specs-card">
                    <h3>Vehicle Specifications</h3>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <span className="spec-icon">📅</span>
                            <div className="spec-text">
                                <span className="spec-label">{t('year') || 'Year'}</span>
                                <span className="spec-value">{car.year}</span>
                            </div>
                        </div>
                        <div className="spec-item">
                            <span className="spec-icon">⛽</span>
                            <div className="spec-text">
                                <span className="spec-label">{t('fuel') || 'Fuel Type'}</span>
                                <span className="spec-value">{car.fuelType}</span>
                            </div>
                        </div>
                        <div className="spec-item">
                            <span className="spec-icon">🛣️</span>
                            <div className="spec-text">
                                <span className="spec-label">{t('kilometers') || 'Kilometers'}</span>
                                <span className="spec-value">{car.kilometers?.toLocaleString()} km</span>
                            </div>
                        </div>
                        <div className="spec-item">
                            <span className="spec-icon">👤</span>
                            <div className="spec-text">
                                <span className="spec-label">{t('owner') || 'Owner'}</span>
                                <span className="spec-value">{car.owners} Owner</span>
                            </div>
                        </div>
                        <div className="spec-item">
                            <span className="spec-icon">🎨</span>
                            <div className="spec-text">
                                <span className="spec-label">{t('color') || 'Color'}</span>
                                <span className="spec-value" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <span className="color-dot" style={{backgroundColor: car.color}}></span>
                                    {car.color}
                                </span>
                            </div>
                        </div>
                        <div className="spec-item">
                            <span className="spec-icon">📍</span>
                            <div className="spec-text">
                                <span className="spec-label">{t('location') || 'Location'}</span>
                                <span className="spec-value">{car.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Info & Actions */}
            <div className="info-sidebar">
                <div className="info-card">
                    <h1 className="details-title">{car.brand} {car.model}</h1>
                    <div className="details-subtitle">{car.variant} • {car.year}</div>
                    
                    <div className="price-tag">
                        {formatPrice(car.price)}
                    </div>

                    <div className="action-buttons">
                        <button 
                            className="btn-primary-large"
                            onClick={() => setShowBookingModal(true)}
                            disabled={car.status !== 'available'}
                        >
                            {car.status === 'available' ? (t('bookNow') || 'Book Test Drive') : 'Not Available'}
                        </button>
                        <button className="btn-secondary-large" onClick={addToWishlist}>
                             Add to Wishlist
                        </button>
                    </div>

                    <div className="seller-note">
                        <h4>Description</h4>
                        <p>{(car.description && typeof car.description === 'object' ? (car.description[language] || car.description['en']) : car.description) || 'No description available for this vehicle.'}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <div className="modal-header">
                      <h2>Book a Test Drive</h2>
                      <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
                  </div>
                  <form onSubmit={handleBookingSubmit}>
                      <div className="form-group">
                          <label>Name</label>
                          <input type="text" name="name" required value={bookingData.name} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                          <label>Email</label>
                          <input type="email" name="email" required value={bookingData.email} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                          <label>Phone</label>
                          <input type="tel" name="phone" required value={bookingData.phone} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                          <label>Preferred Date</label>
                          <input type="date" name="visitDate" required value={bookingData.visitDate} onChange={handleInputChange} />
                      </div>
                      <button type="submit" className="submit-btn">Confirm Booking</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default CarDetails;
