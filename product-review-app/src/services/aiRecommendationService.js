import axios from 'axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const getPersonalizedRecommendations = async (userPreferences, currentProduct) => {
  try {
    const prompt = `Based on the following user preferences and current product, suggest 3 personalized product recommendations:
    
    User Preferences:
    ${JSON.stringify(userPreferences, null, 2)}
    
    Current Product:
    ${JSON.stringify(currentProduct, null, 2)}
    
    Please provide recommendations in the following format:
    {
      "recommendations": [
        {
          "id": "product_id",
          "name": "product_name",
          "reason": "personalized_reason"
        }
      ]
    }`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a product recommendation AI that suggests personalized products based on user preferences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const recommendations = JSON.parse(response.data.choices[0].message.content);
    return recommendations;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    throw error;
  }
};

export const analyzeUserBehavior = async (userInteractions) => {
  try {
    const prompt = `Analyze the following user interactions and provide insights about their preferences:
    
    User Interactions:
    ${JSON.stringify(userInteractions, null, 2)}
    
    Please provide analysis in the following format:
    {
      "preferences": {
        "categories": ["category1", "category2"],
        "priceRange": "low/medium/high",
        "features": ["feature1", "feature2"],
        "brands": ["brand1", "brand2"]
      },
      "insights": ["insight1", "insight2"]
    }`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI that analyzes user behavior and provides insights about their preferences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysis = JSON.parse(response.data.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    throw error;
  }
}; 