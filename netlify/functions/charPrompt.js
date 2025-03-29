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
    const { prompt, aspect_ratio = "landscape", style = "Realistic" } = requestBody;
    console.log("Character to process:", prompt);
    console.log("Aspect ratio:", aspect_ratio);
    console.log("Style:", style);
    
    // Add style-specific guidance to the system prompt
    let styleGuidance = "";
    switch (style.toLowerCase()) {
      case "ghibli":
        styleGuidance = "Create a description that captures the whimsical, hand-drawn aesthetic of Studio Ghibli films, with soft colors, expressive features, and magical atmosphere.";
        break;
      case "nintendo":
        styleGuidance = "Create a description that matches Nintendo's iconic game art style, with bold colors, clean lines, and a playful, cartoon-like quality.";
        break;
      case "lego":
        styleGuidance = "Create a description that matches the distinctive Lego minifigure style, with blocky proportions, plastic-like textures, and characteristic facial features.";
        break;
      case "southpark":
        styleGuidance = "Create a description that matches South Park's distinctive cutout animation style, with simple shapes, flat colors, and characteristic facial features.";
        break;
      case "pixar":
        styleGuidance = "Create a description that captures Pixar's signature 3D animation style, with smooth surfaces, expressive features, and warm, inviting lighting.";
        break;
      default:
        styleGuidance = "Create a photoRealistic description with natural lighting, detailed textures, and professional photography quality.";
    }

    const systemPrompt = `You are an expert at creating detailed character descriptions for AI image generation. The only input you will receive is {character_name} (e.g., "Lord Voldemort," "Tyrion Lannister," etc.). Based on this single input, you must:

Identify the canonical source (if known or commonly associated).
Research and include any key defining traits from official or popular descriptions:
Facial structure, body proportions, hair color/style, eye color/shape, age range.
Distinctive features, including scars, tattoos, iconic accessories, etc.
Ensure appropriate detail level for the requested style.
Incorporate technical details to enhance the specific style requested.
Then you will output a single, cohesive prompt that follows this structure:

Character Name and the implied or canonical source (if identifiable).
Age Range (as best inferred from canonical sources).
Detailed facial and physical description appropriate to the requested style.
Clothing and accessories authentic to the character's setting or style.
Environment or background consistent with the character's world.
Pose and expression that reflect the character's personality or mood.
Style-specific technical descriptors for maximum quality.`;
    
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
          content: `${systemPrompt} ${aspectRatioGuidance} ${styleGuidance}`,
        },
        { role: "user", content: prompt },
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
