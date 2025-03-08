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
    
    let { prompt, premium, aspect_ratio = "landscape", style = "default" } = requestBody;
    console.log("Prompt:", prompt);
    console.log("Premium:", premium);
    console.log("Aspect ratio:", aspect_ratio);
    console.log("Style:", style);
    
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
    
    // Map the aspect_ratio parameter to actual ratios
    let aspectRatioValue;
    switch(aspect_ratio) {
      case "square":
        aspectRatioValue = "1:1";
        break;
      case "portrait": 
        aspectRatioValue = "2:3";
        break;
      case "landscape":
      default:
        aspectRatioValue = "3:2";
        break;
    }
    
    // Determine which model to use based on premium status
    let modelVersion;
    
    if (premium) {
      // Premium users get the flux-1.1-pro model only
      modelVersion = "black-forest-labs/flux-1.1-pro";
      
      // We'll handle different styles by modifying the prompt
      let stylePrefix = "";
      
      if (style === "anime") {
        stylePrefix = "anime style, manga art, ";
      } else if (style === "artistic") {
        stylePrefix = "artistic painting, painterly style, ";
      } else if (style === "claymation") {
        stylePrefix = "claymation style, 3D clay model, ";
      }
      
      // Prepend the style prefix to the prompt
      if (stylePrefix) {
        prompt = stylePrefix + prompt;
      }
    } else {
      // Non-premium users always get the basic model
      modelVersion = "black-forest-labs/flux-schnell";
    }
    
    console.log("Using model:", modelVersion);
    console.log("Final prompt:", prompt);
    
    // Call Replicate API
    const input = {
      prompt: prompt,
      num_outputs: 1,
      aspect_ratio: aspectRatioValue,
      output_format: "jpg",
      output_quality: 100,
      seed: 17329,
      safety_tolerance: 6,
    };

    const output = await replicate.run(modelVersion, { input });

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