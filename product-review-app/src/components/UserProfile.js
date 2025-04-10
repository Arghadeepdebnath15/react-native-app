import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userProfileService';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfile.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: '',
    bio: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
        setFormData({
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          profilePicture: userProfile.profilePicture || '',
          bio: userProfile.bio || ''
        });
        if (userProfile.profilePicture) {
          setImagePreview(userProfile.profilePicture);
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
    formData.append('timestamp', Math.floor(Date.now() / 1000));

    try {
      if (!process.env.REACT_APP_CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary cloud name is not configured');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.secure_url) {
        throw new Error('No secure URL returned from Cloudinary');
      }
      
      // Update both the form data and the image preview
      setFormData(prev => ({
        ...prev,
        profilePicture: data.secure_url
      }));
      setImagePreview(data.secure_url);

      // Update the user's profile picture in the users collection
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          photoURL: data.secure_url,
          profilePicture: data.secure_url
        });
      }

      setError('');
    } catch (err) {
      setError(`Failed to upload image: ${err.message}`);
      console.error('Error uploading image:', err);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const _handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setError('');
    try {
      // Ensure profilePicture is not undefined
      const profileData = {
        ...formData,
        profilePicture: formData.profilePicture || profile?.profilePicture || ''
      };
      
      await updateUserProfile(currentUser.uid, profileData);
      setProfile(prev => ({ ...prev, ...profileData }));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  if (!currentUser) {
    return <div className="profile-error">Please log in to view your profile.</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <div className="header-buttons">
          <button className="close-button" onClick={() => navigate(-1)} aria-label="Close profile">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            <img 
              src={imagePreview || profile?.profilePicture || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt="Profile" 
              className="profile-picture"
            />
            {isEditing && (
              <div className="profile-picture-upload">
                <label htmlFor="profile-picture" className="upload-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </label>
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Changes
              </button>
              <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Full Name</label>
              <p>{profile?.name || 'Not set'}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{profile?.email || 'Not set'}</p>
            </div>
            <div className="info-group">
              <label>Bio</label>
              <p>{profile?.bio || 'No bio added yet'}</p>
            </div>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
