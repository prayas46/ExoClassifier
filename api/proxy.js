// Vercel serverless function to proxy API requests and handle CORS
// This file should be placed in /api/proxy.js for Vercel deployment

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    let targetUrl, fetchOptions;
    
    if (req.method === 'GET') {
      // Handle GET requests (health check, model info)
      const path = req.query.path || '/';
      targetUrl = `https://exoplanet-classifier-backend-api.onrender.com${path}`;
      fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      };
    } else if (req.method === 'POST') {
      // Handle POST requests
      const { path, ...body } = req.body || {};
      targetUrl = `https://exoplanet-classifier-backend-api.onrender.com${path || '/'}`;
      
      console.log('Proxying POST request to:', targetUrl);
      console.log('Body keys:', Object.keys(body));
      
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
      
      // Add body for POST requests
      if (Object.keys(body).length > 0) {
        fetchOptions.body = JSON.stringify(body);
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('Making request to:', targetUrl);
    const response = await fetch(targetUrl, fetchOptions);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      return res.status(response.status).json({ 
        error: 'API request failed', 
        status: response.status,
        message: errorText
      });
    }

    const data = await response.json();
    console.log('Successful response received');
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      message: error.message 
    });
  }
}