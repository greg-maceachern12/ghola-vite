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

    // Add style-specific guidance with more detail
    let styleGuidance = "";
    switch (style.toLowerCase()) {
      case "ghibli":
        styleGuidance = "Emphasize a hand-drawn, painted look reminiscent of Hayao Miyazaki. Use terms like 'watercolor textures', 'soft outlines', 'lush natural backgrounds', 'expressive, slightly rounded features', 'gentle lighting', 'whimsical atmosphere'.";
        break;
      case "nintendo":
        styleGuidance = "Focus on bright, saturated, primary colors. Use terms like 'cel-shaded', 'bold outlines', 'clean vector art style', 'appealing character design', 'simplified shapes', 'game art'.";
        break;
      case "lego":
        styleGuidance = "Describe the character *as* a Lego minifigure. Use terms like 'plastic sheen', 'cylindrical head', 'blocky torso', 'claw hands', 'printed facial expression', 'studs', 'modular bricks'.";
        break;
      case "southpark":
        styleGuidance = "Describe the character using the distinctive South Park cutout animation style. Use terms like 'construction paper texture', 'simple geometric shapes', 'flat colors', 'bold black outlines', 'minimalist features', 'crude animation style'.";
        break;
      case "pixar":
        styleGuidance = "Aim for a high-quality 3D render look. Use terms like 'smooth surfaces', 'subsurface scattering', 'realistic yet stylized features', 'expressive eyes', 'cinematic lighting', 'detailed textures', 'warm color palette'.";
        break;
      default: // Realistic
        styleGuidance = "Focus on photorealism. Use terms like 'photorealistic', 'DSLR photo', 'sharp focus', 'detailed skin texture', 'natural lighting', '8k resolution', 'cinematic composition', 'professional photography'.";
    }

    // Revised system prompt emphasizing style integration
    const systemPrompt = `You are an expert at creating detailed character descriptions for AI image generation, specifically tailored to the requested visual style: '${style}'. The only input you will receive is {character_name}. Your primary goal is to generate a prompt that results in an image strongly reflecting this style.

Based on the character name and the target style ('${style}'), you must:

1.  **Identify Source & Traits:** Determine the canonical source (if known) and research key defining traits (facial structure, body, hair, eyes, age, distinctive features like scars/tattoos).
2.  **Integrate Style:** Weave the requested style ('${style}') throughout the description. Use keywords, artistic techniques, and visual elements specific to that style. ${styleGuidance}
3.  **Add Technical Details:** Include style-specific technical descriptors (e.g., 'cinematic lighting', 'cel-shaded', 'detailed texture', 'soft focus') to enhance quality according to the style.
4.  **Structure Output:** Output a single, cohesive prompt including:
    *   Character Name and source (if identifiable).
    *   Age Range.
    *   Detailed facial/physical description *in the requested style*.
    *   Clothing/accessories authentic to the character *and style*.
    *   Environment/background consistent with the character's world *and style*.
    *   Pose/expression reflecting personality *and style*.
    *   Style-specific technical descriptors.

Output *only* the final prompt, ready for an image generation model.`;

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

    // Call OpenAI API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt, // Use the revised system prompt which now includes style/aspect guidance
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
