import React, { useState, useEffect } from 'react';
import { getPersonalizedRecommendations, analyzeUserBehavior } from '../services/aiRecommendationService';
import '../styles/AIRecommendations.css';

const AIRecommendations = ({ currentProduct, userInteractions }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // First, analyze user behavior to get preferences
        const analysis = await analyzeUserBehavior(userInteractions);
        setUserPreferences(analysis.preferences);

        // Then get personalized recommendations
        const recommendationsData = await getPersonalizedRecommendations(
          analysis.preferences,
          currentProduct
        );
        
        setRecommendations(recommendationsData.recommendations);
      } catch (err) {
        console.error('Error fetching AI recommendations:', err);
        setError('Failed to load personalized recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (currentProduct && userInteractions) {
      fetchRecommendations();
    }
  }, [currentProduct, userInteractions]);

  if (loading) {
    return (
      <div className="ai-recommendations-section">
        <h2>AI-Powered Recommendations</h2>
        <div className="loading-spinner">Loading personalized recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-recommendations-section">
        <h2>AI-Powered Recommendations</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="ai-recommendations-section">
      <h2>AI-Powered Recommendations</h2>
      <div className="recommendations-grid">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="recommendation-card">
            <h3>{recommendation.name}</h3>
            <p className="recommendation-reason">{recommendation.reason}</p>
            {userPreferences && (
              <div className="preference-tags">
                {userPreferences.categories.map((category, index) => (
                  <span key={index} className="preference-tag">{category}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations; 