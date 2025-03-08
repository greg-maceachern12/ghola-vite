// netlify/functions/charPrompt.js
const { OpenAI } = require("openai");

// Handle OPTIONS requests for CORS
const handleOptions = () => {
  return {
    statusCode: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  };
};

exports.handler = async function (event, context) {
  // Handle preflight CORS requests
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: {
        Allow: "POST, OPTIONS",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
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
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
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
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };
    }

    // Extract parameters
    const { prompt, aspect_ratio = "landscape", style = "default" } = requestBody;
    console.log("Character to process:", prompt);
    console.log("Aspect ratio:", aspect_ratio);
    console.log("Style:", style);
    
    const systemPrompt = `You are an expert at creating detailed character descriptions for AI image generation that produce photorealistic human portraits. The only input you will receive is {character_name} (e.g., "Lord Voldemort," "Tyrion Lannister," etc.). Based on this single input, you must:

Identify the canonical source (if known or commonly associated).
Research and include any key defining traits from official or popular descriptions:
Facial structure, body proportions, hair color/style, eye color/shape, age range.
Distinctive features, including scars, tattoos, iconic accessories, etc.
Ensure photorealistic detail by describing subtle imperfections and natural details (freckles, pores, wrinkles, asymmetries).
Incorporate technical photography details to enhance realism (e.g., "portrait shot, 85mm lens, shallow depth of field, 8K, cinematic lighting, subsurface scattering").
Then you will output a single, cohesive prompt that follows this structure:

Character Name and the implied or canonical source (if identifiable).
Age Range (as best inferred from canonical sources).
Detailed facial and physical description (natural skin texture, slight asymmetries, any distinctive traits).
Clothing and accessories authentic to the character's setting or style.
Environment or background consistent with the character's world.
Pose and expression that reflect the character's personality or mood.
Professional photography descriptors and high-resolution rendering terms for maximum realism.`;
    
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Please provide a prompt in the request body",
        }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };
    }

    // Add aspect ratio guidance to the system prompt when needed
    let aspectRatioGuidance = "";
    if (aspect_ratio === "portrait") {
      aspectRatioGuidance = "Create the description to work well in a vertical/portrait (2:3) format. Focus on upper body and face.";
    } else if (aspect_ratio === "square") {
      aspectRatioGuidance = "Create the description to work well in a square (1:1) format, with a balanced composition.";
    } else {
      aspectRatioGuidance = "Create the description to work well in a horizontal/landscape (3:2) format, allowing for more environment or context.";
    }

    // Call OpenAI API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${systemPrompt} ${aspectRatioGuidance}`,
        },
        { role: "user", content: `${prompt}, [Source or origin if known]. [Approximate age range]. 
[Detailed face and physical description]. 
[Authentic clothing and accessories]. 
[Appropriate environment or background]. 
[Natural pose and expression]. 
Portrait photography, photorealistic, natural lighting, cinematic quality, 
detailed skin texture, professional photography, 8k, highly detailed human features, 
portrait shot, 85mm lens, shallow depth of field, subsurface scattering.` },
      ],
    });

    // Extract the response
    const enhancedPrompt = chatResponse.choices[0].message.content.trim();

    // Return the enhanced prompt
    return {
      statusCode: 200,
      body: JSON.stringify({ response: enhancedPrompt }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  } catch (error) {
    console.error("Error generating prompt:", error);

    let errorMessage = "An error occurred while processing your request.";

    if (error.response) {
      errorMessage = `OpenAI API returned an error: ${
        error.response.data?.error?.message || "Unknown API error"
      }`;
    } else if (error.request) {
      errorMessage =
        "No response received from OpenAI API. Please try again later.";
    } else {
      errorMessage = `Error setting up the request: ${error.message}`;
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }
};
