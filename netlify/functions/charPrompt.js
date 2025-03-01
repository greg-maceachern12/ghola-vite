// netlify/functions/charPrompt.js
const { OpenAI } = require('openai');

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

  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OpenAI API Key not configured" }),
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }

    // Initialize OpenAI client with API key
    const openai = new OpenAI({ apiKey });

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
        body: JSON.stringify({ error: 'Please provide a prompt in the request body' }),
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }

    // Call OpenAI API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Lore-Accurate Research:
Prioritize original author descriptions over adaptations or fan interpretations. Note any described flaws, asymmetries, or distinctive features. If not given enough data about the character, make your best guess.
Resist Beautification:
Explicitly include non-idealized features in the prompt. Use neutral descriptors instead of subjective or flattering terms.
Age and Wear:
Accurately represent the character's age. Include signs of aging, scars, or wear where appropriate.
Body Diversity:
Describe body types precisely, avoiding default to fit or idealized forms. Include any mentioned physical quirks or imperfections.
Prompt Structure: "[Character Name] from [Source]. [Age]. [Accurate physical description including distinctive/non-idealized features]. [Authentic clothing and accessories]. [Environment]. [Characteristic pose/expression]. Photorealistic, historically accurate, no beautification or idealization." Anti-Beautification Clause: End every prompt with: "Maintain all described features without alteration. Do not enhance or idealize appearance."
Example: "Tyrion Lannister from 'A Song of Ice and Fire'. Middle-aged man of dwarfish stature. Mismatched eyes (one green, one black), large head, pronounced brow, squashed-in face, stubby legs. Scraggly beard mix of pale blond and black hair. Wearing fine but worn clothing in Lannister crimson. Standing in a medieval castle hall, expression cynical and world-weary. Photorealistic, historically accurate, no beautification or idealization. Maintain all described features without alteration. Do not enhance or idealize appearance."`
        },
        { role: "user", content: prompt }
      ]
    });

    // Extract the response
    const enhancedPrompt = chatResponse.choices[0].message.content.trim();
    
    // Return the enhanced prompt
    return {
      statusCode: 200,
      body: JSON.stringify({ response: enhancedPrompt }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  } catch (error) {
    console.error("Error generating prompt:", error);
    
    let errorMessage = "An error occurred while processing your request.";
    
    if (error.response) {
      errorMessage = `OpenAI API returned an error: ${error.response.data?.error?.message || 'Unknown API error'}`;
    } else if (error.request) {
      errorMessage = "No response received from OpenAI API. Please try again later.";
    } else {
      errorMessage = `Error setting up the request: ${error.message}`;
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }
};