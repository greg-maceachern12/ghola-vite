// netlify/functions/characterSD.js
const Replicate = require("replicate");
const Airtable = require("airtable");
// const Loops = require("loops");

// Common CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS requests for CORS
const handleOptions = () => ({
  statusCode: 204,
  headers: { ...CORS_HEADERS, "Access-Control-Max-Age": "86400" },
});

// Utility to send responses with JSON body
const sendResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json", ...CORS_HEADERS },
});

// Function to save generation data to Airtable
const saveToAirtable = async (data) => {
  const { character, prompt, premium, aspect_ratio, style, imageUrl, email } = data;
  console.log("Email:", email);

  // Get Airtable API key from environment variables
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

  if (!AIRTABLE_API_KEY) {
    console.error("Airtable API key not configured");
    return false;
  }

  try {
    // Initialize Airtable client
    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
      AIRTABLE_BASE_ID
    );

    // For base64 images, we'll store just a reference since the data is too large
    const imageUrlForAirtable = imageUrl.startsWith('data:image') 
      ? 'base64_image_generated' 
      : imageUrl;

    // Create a new record in Airtable
    return new Promise((resolve, reject) => {
      base(AIRTABLE_TABLE_NAME).create(
        [
          {
            fields: {
              Character: character || "",
              Prompt: prompt || "",
              email: email || "not-entered",
              Premium: premium ? "Yes" : "No",
              "Aspect Ratio": aspect_ratio || "landscape",
              Style: style || "Realistic",
              "Image URL": imageUrlForAirtable,
              "Created At": new Date().toISOString(),
              Source: "Ghola Web App",
              // Only add attachment if it's a URL, not base64
              attach: !imageUrl.startsWith('data:image') ? [{ url: imageUrl }] : []
            },
          },
        ],
        function (err, records) {
          if (err) {
            console.error("Error saving to Airtable:", err);
            reject(err);
            return;
          }

          console.log(
            "Successfully saved to Airtable. Record IDs:",
            records.map((record) => record.getId())
          );
          resolve(true);
        }
      );
    });
  } catch (error) {
    console.error("Error initializing Airtable:", error);
    return false;
  }
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  if (event.httpMethod !== "POST") return sendResponse(405, { error: "Method Not Allowed" });

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (err) {
    return sendResponse(400, { error: "Invalid JSON in request body" });
  }

  const { prompt, premium, aspect_ratio = "landscape", style = "Realistic", character, email } = requestBody;
  if (!prompt) return sendResponse(400, { error: "Please provide a prompt in the request body" });

  let finalPrompt = prompt;
  if (style && style !== "realistic") {
    finalPrompt = `${prompt}, in the style of ${style}`;
  }

  console.log("Final prompt:", finalPrompt);

  try {
    let imageUrl;

    // Configure Replicate client
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    
    // Map aspect ratio to values for Flux
    const aspectMap = { square: "1:1", portrait: "2:3", landscape: "3:2" };
    const aspectRatioValue = aspectMap[aspect_ratio] || "3:2";

    // Base configuration for both premium and non-premium
    const baseConfig = {
      prompt: finalPrompt,
      num_outputs: 1,
      aspect_ratio: aspectRatioValue,
      output_format: "jpg",
      output_quality: 100,
      seed: 17329,
      prompt_upsampling: true,
      disable_safety_checker: true,
    };

    if (premium) {
      // Use Flux Pro for premium users with higher quality settings
      // const input = {
      //   ...baseConfig,
      //   model_version: "pro",
      //   quality_preset: "high",
      //   guidance_scale: 7.5,
      //   negative_prompt: "ugly, deformed, noisy, blurry, low quality, anime, cartoon, drawing, illustration, boring, bad art"
      // };
      const input = {
        prompt: prompt,
        openai_api_key: process.env.OPENAI_API_KEY,
        quality: "medium",
        moderation: "low",
        aspect_ratio: aspectRatioValue,
        output_format: "webp",
        number_of_images: 1,
        output_compression: 90
      };

      const output = await replicate.run("openai/gpt-image-1", { input });
      imageUrl = Array.isArray(output) ? output[0] : output;
    } else {
      // Use standard Flux for non-premium users
      const output = await replicate.run("black-forest-labs/flux-schnell", { input: baseConfig });
      imageUrl = Array.isArray(output) ? output[0] : output;
    }

    console.log("Image URL generated");
    
    if (imageUrl) {
      await saveToAirtable({ character, prompt, premium, aspect_ratio, style, imageUrl, email });
      // await sendToLoops(email, premium);
    }
    
    return sendResponse(200, { result: [imageUrl] });
  } catch (error) {
    console.error("Error generating image:", error);
    // return sendResponse(500, { error: "An error occurred while processing the request", details: error.message });
  }
};
