// Get the backend URL from environment or use default
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://newrepo-pk31.onrender.com';
  }
  return `http://localhost:8080`;
};

// Convert relative image URLs to absolute URLs
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already an absolute URL (including Cloudinary URLs), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a relative URL starting with /uploads, prepend the backend URL
  if (imageUrl.startsWith('/uploads')) {
    return `${getBackendUrl()}${imageUrl}`;
  }

  // For any other case, just return the original URL
  return imageUrl;
}; 