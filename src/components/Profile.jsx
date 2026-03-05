import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Profile.css';

const API_BASE = 'http://localhost:5000';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    phone: '',
  });
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);

  const hasChanges = useMemo(() => {
    if (!initialData) return false;
    const trim = (s) => (s || '').trim();
    return (
      trim(formData.firstName) !== trim(initialData.firstName) ||
      trim(formData.lastName) !== trim(initialData.lastName) ||
      trim(formData.phone) !== trim(initialData.phone) ||
      trim(formData.location) !== trim(initialData.location)
    );
  }, [formData, initialData]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      navigate('/');
      return;
    }
    fetchProfile();
    fetchUserActivity();
  }, [isAuthenticated, user?.email, navigate]);

  const deriveNameParts = (name) => {
    if (!name || typeof name !== 'string') return { first: '', last: '' };
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return { first: parts[0], last: '' };
    return {
      first: parts[0],
      last: parts.slice(1).join(' '),
    };
  };

  const fetchProfile = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/profile?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        const { first, last } = deriveNameParts(u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.name);
        const data_ = {
          firstName: u.firstName || first,
          lastName: u.lastName || last,
          email: u.email || '',
          location: u.location || '',
          phone: u.phone || '',
        };
        setFormData(data_);
        setInitialData({ ...data_ });
      } else {
        const { first, last } = deriveNameParts(user.name);
        const data_ = {
          firstName: user.firstName || first,
          lastName: user.lastName || last,
          email: user.email || '',
          location: user.location || '',
          phone: user.phone || '',
        };
        setFormData(data_);
        setInitialData({ ...data_ });
      }
    } catch {
      const { first, last } = deriveNameParts(user.name);
      const data_ = {
        firstName: user.firstName || first,
        lastName: user.lastName || last,
        email: user.email || '',
        location: user.location || '',
        phone: user.phone || '',
      };
      setFormData(data_);
      setInitialData({ ...data_ });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    if (!user?.email) return;
    try {
      const [enqRes, bookingRes] = await Promise.all([
        fetch(`${API_BASE}/api/enquiries?email=${encodeURIComponent(user.email)}`),
        fetch(`${API_BASE}/api/bookings?email=${encodeURIComponent(user.email)}`),
      ]);
      const [enqData, bookingData] = await Promise.all([enqRes.json(), bookingRes.json()]);
      if (enqData.success && Array.isArray(enqData.data)) {
        setEnquiries(enqData.data);
      }
      if (bookingData.success && Array.isArray(bookingData.data)) {
        setBookings(bookingData.data);
      }
    } catch {
      // fail silently; activity is non-critical
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!isEditing) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedInEmail = user?.email;
    if (!loggedInEmail || saving || !hasChanges) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    const payload = {
      email: loggedInEmail,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      location: formData.location.trim(),
      phone: formData.phone.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': loggedInEmail,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.user) {
        updateUser(data.user);
        setInitialData({
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: data.user.email,
          location: payload.location,
          phone: payload.phone,
        });
        setMessage({ type: 'success', text: t('profileUpdated') });
      } else {
        setMessage({ type: 'error', text: data.message || t('profileUpdateFailed') });
      }
    } catch {
      setMessage({ type: 'error', text: t('profileUpdateFailed') });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">{t('loading') || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-edit-header">
          <div>
            <h1 className="profile-title">{t('yourProfile')}</h1>
            <p className="profile-subtitle">
              {t('editProfileSubtitle') || 'View and edit your account information'}
            </p>
          </div>
          <div className="profile-edit-actions">
            {!isEditing && (
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
            {isEditing && (
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => {
                  setFormData(initialData || formData);
                  setIsEditing(false);
                  setMessage({ type: '', text: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="profile-layout">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="firstName">{t('firstName')}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('firstName')}
                  readOnly={!isEditing}
                  className={!isEditing ? 'profile-input-readonly' : ''}
                />
              </div>
              <div className="profile-field">
                <label htmlFor="lastName">{t('lastName')}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('lastName')}
                  readOnly={!isEditing}
                  className={!isEditing ? 'profile-input-readonly' : ''}
                />
              </div>
              <div className="profile-field profile-field-full">
                <label htmlFor="email">{t('email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="profile-input-readonly"
                  aria-readonly="true"
                />
                <span className="profile-field-hint">
                  {t('emailNotEditable') || 'Email cannot be changed'}
                </span>
              </div>
              <div className="profile-field profile-field-full">
                <label htmlFor="phone">{t('phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('phone')}
                  readOnly={!isEditing}
                  className={!isEditing ? 'profile-input-readonly' : ''}
                />
              </div>
              <div className="profile-field profile-field-full">
                <label htmlFor="location">{t('location')}</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t('locationPlaceholder') || 'City, State or Region'}
                  readOnly={!isEditing}
                  className={!isEditing ? 'profile-input-readonly' : ''}
                />
              </div>
            </div>

            {message.text && (
              <div className={`profile-message profile-message-${message.type}`}>
                {message.text}
              </div>
            )}

            {isEditing && (
              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving || !hasChanges}
              >
                {saving ? (t('saving') || 'Saving...') : t('save')}
              </button>
            )}
          </form>

          <div className="profile-section">
            <h2 className="profile-section-title">Your Enquiries</h2>
            {enquiries.length === 0 ? (
              <p className="profile-activity-empty">You have not submitted any enquiries yet.</p>
            ) : (
              <div className="profile-activity-list">
                {enquiries.map((enq) => (
                  <div key={enq._id} className="profile-activity-card">
                    <div className="profile-activity-title">
                      {enq.preferredBrand || enq.preferredModel
                        ? `${enq.preferredBrand || ''} ${enq.preferredModel || ''}`.trim()
                        : 'General enquiry'}
                    </div>
                    <div className="profile-activity-meta">
                      <span>Status: {enq.status}</span>
                      <span>
                        Date:{' '}
                        {new Date(enq.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {enq.city && <span>City: {enq.city}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="profile-section-title" style={{ marginTop: '1.5rem' }}>
              Your Bookings
            </h2>
            {bookings.length === 0 ? (
              <p className="profile-activity-empty">You have not booked any cars yet.</p>
            ) : (
              <div className="profile-activity-list">
                {bookings.map((b) => (
                  <div key={b._id} className="profile-activity-card">
                    <div className="profile-activity-title">
                      {b.carId
                        ? `${b.carId.brand} ${b.carId.model} (${b.carId.year})`
                        : 'Car booking'}
                    </div>
                    <div className="profile-activity-meta">
                      <span>Status: {b.status}</span>
                      <span>
                        Booked on:{' '}
                        {new Date(b.bookingDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {b.visitDate && (
                        <span>
                          Visit:{' '}
                          {new Date(b.visitDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
