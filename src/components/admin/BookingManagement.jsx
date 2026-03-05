import React, { useState, useEffect } from 'react';
import { SearchIcon, CloseIcon, CalendarIcon } from '../Icons';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, dateFilter, statusFilter]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings');
      const data = await response.json();
      if (data.success) {
        // Sort by date descending
        const sortedData = data.data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        setBookings(sortedData);
        setFilteredBookings(sortedData);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...bookings];

    // 1. Global Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.customerName && item.customerName.toLowerCase().includes(lowerTerm)) ||
        (item.customerEmail && item.customerEmail.toLowerCase().includes(lowerTerm)) ||
        (item.customerPhone && item.customerPhone.includes(lowerTerm)) ||
        (item.carId && item.carId.brand && item.carId.brand.toLowerCase().includes(lowerTerm)) ||
        (item.carId && item.carId.model && item.carId.model.toLowerCase().includes(lowerTerm))
      );
    }

    // 2. Date Filter
    if (dateFilter.startDate) {
      const start = new Date(dateFilter.startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(item => new Date(item.bookingDate) >= start);
    }
    if (dateFilter.endDate) {
      const end = new Date(dateFilter.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(item => new Date(item.bookingDate) <= end);
    }

    // 3. Status Filter
    if (statusFilter) {
      result = result.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredBookings(result);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
    setStatusFilter('');
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDetailModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBooking(null), 300);
    document.body.style.overflow = 'unset';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="page-title">Recent Bookings</h2>
        <span className="admin-badge">
            Total: {filteredBookings.length} / {bookings.length}
        </span>
      </div>

      {/* Filters Section */}
      <div className="filters-container">
        {/* Global Search */}
        <div className="search-bar-container">
          <SearchIcon className="search-icon-absolute" fill="currentColor" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by customer, email, phone, car..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Advanced Filters */}
        <div className="filters-grid">
            <div className="filter-group">
                <label className="filter-label">Date Range</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="date-input-wrapper">
                        <CalendarIcon className="date-icon" fill="currentColor" />
                        <input 
                            type="date" 
                            className="filter-input date-input" 
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                        />
                    </div>
                    <span className="text-secondary">to</span>
                    <div className="date-input-wrapper">
                        <CalendarIcon className="date-icon" fill="currentColor" />
                        <input 
                            type="date" 
                            className="filter-input date-input" 
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="filter-group">
                <label className="filter-label">Status</label>
                <select 
                    className="filter-input" 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>

        <button className="reset-filters-btn" onClick={resetFilters}>
            <CloseIcon style={{ width: '15px', height: '15px', marginRight: '4px', verticalAlign: 'text-bottom' }} fill="currentColor" />
            Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : (
        <div className="admin-table-container">
            <table className="admin-table">
            <thead>
                <tr>
                <th>Customer</th>
                <th>Car Details</th>
                <th>Contact Info</th>
                <th>Booking Date</th>
                <th>Status</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => (
                    <tr key={booking._id}>
                    <td>
                        <div className="text-primary" style={{ fontWeight: '600' }}>{booking.customerName}</div>
                    </td>
                    <td>
                        {booking.carId ? (
                            <>
                                <div className="text-secondary" style={{ fontWeight: '500' }}>{booking.carId.brand} {booking.carId.model}</div>
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{booking.carId.year}</div>
                            </>
                        ) : <span className="text-muted" style={{ fontStyle: 'italic' }}>Car details unavailable</span>}
                    </td>
                    <td>
                        <div className="text-secondary">{booking.customerPhone}</div>
                        <a href={`mailto:${booking.customerEmail}`} style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>{booking.customerEmail}</a>
                    </td>
                    <td>{new Date(booking.bookingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                        <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                        {booking.status}
                        </span>
                    </td>
                    <td>
                        <button className="action-btn btn-view" onClick={() => openDetailModal(booking)} title="View Details">
                            View
                        </button>
                    </td>
                    </tr>
                ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>
                            No bookings found matching your filters.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={closeDetailModal}>
            <div className="modal-content-large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Booking Details</h2>
                    <button className="modal-close-btn" onClick={closeDetailModal}>
                        <CloseIcon fill="currentColor" />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="detail-section">
                        <h3>Customer Information</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">{selectedBooking.customerName}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email Address</span>
                                <span className="detail-value">{selectedBooking.customerEmail}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Phone Number</span>
                                <span className="detail-value">{selectedBooking.customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Vehicle Details</h3>
                        {selectedBooking.carId ? (
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Car</span>
                                    <span className="detail-value">{selectedBooking.carId.brand} {selectedBooking.carId.model}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Year</span>
                                    <span className="detail-value">{selectedBooking.carId.year}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Price</span>
                                    <span className="detail-value">₹{selectedBooking.carId.price ? selectedBooking.carId.price.toLocaleString() : 'N/A'}</span>
                                </div>
                                {selectedBooking.carId.primaryImage && (
                                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                                        <img 
                                            src={`http://localhost:5000/${selectedBooking.carId.primaryImage}`} 
                                            alt="Car" 
                                            style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', marginTop: '8px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted" style={{ fontStyle: 'italic' }}>Car details are no longer available (Car might have been deleted).</p>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Booking Status</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Date</span>
                                <span className="detail-value">
                                    {new Date(selectedBooking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Current Status</span>
                                <div>
                                    <span className={`status-badge status-${selectedBooking.status.toLowerCase()}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer" style={{ padding: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={closeDetailModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
