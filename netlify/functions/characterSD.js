// netlify/functions/characterSD.js
const Replicate = require("replicate");

// Handle OPTIONS requests for CORS
const handleOptions = () => {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  };
};

exports.handler = async function(event, context) {
  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: {
        'Allow': 'POST, OPTIONS',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
  
  // Check for API key
  const API_KEY = process.env.REPLICATE_API_TOKEN;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API Key not configured" }),
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }

  try {
    // Parse the request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
    
    const { prompt } = requestBody;
    
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please provide a prompt in the request body" }),
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: API_KEY,
    });
    
    console.log("Processing prompt:", prompt);
    
    // Call Replicate API
    const input = {
      prompt: prompt,
      num_outputs: 1,
      aspect_ratio: "9:16",
      output_format: "jpg",
      output_quality: 100
    };

    const output = await replicate.run("black-forest-labs/flux-schnell", { input });

    // Return the image data
    return {
      statusCode: 200,
      body: JSON.stringify({ result: output }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  } catch (error) {
    console.error("Error generating image:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "An error occurred while processing the request",
        details: error.message
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }
};