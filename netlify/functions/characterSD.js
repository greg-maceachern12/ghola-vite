// netlify/functions/characterSD.js
const Replicate = require("replicate");
const Airtable = require("airtable");

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
              "Image URL": imageUrl || "",
              "Created At": new Date().toISOString(),
              Source: "Ghola Web App",
              attach: imageUrl ? [{ url: imageUrl }] : [] // Add the image URL as an attachment
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

  // Map aspect ratio to values
  const aspectMap = { square: "1:1", portrait: "2:3", landscape: "3:2" };
  const aspectRatioValue = aspectMap[aspect_ratio] || "3:2";

  let modelVersion, finalPrompt = prompt;
  if (premium) {
    modelVersion = "black-forest-labs/flux-1.1-pro";
    // Map style to prefix
    const stylePrefixes = {
      ghibli: "Studio Ghibli style, Hayao Miyazaki, whimsical hand-drawn animation, soft colors, magical atmosphere, ",
      nintendo: "Nintendo game art style, video game character, bold colors, clean lines, playful cartoon style, ",
      lego: "Lego minifigure style, plastic toy, blocky proportions, characteristic facial features, ",
      southpark: "South Park TV show style, cutout animation, simple shapes, flat colors, characteristic facial features, ",
      pixar: "Pixar animation style, 3D animated movie, smooth surfaces, expressive features, warm lighting, "
    };
    const prefix = stylePrefixes[style.toLowerCase()] || "";
    finalPrompt = prefix ? prefix + prompt : prompt;
  } else {
    modelVersion = "black-forest-labs/flux-schnell";
  }

  console.log("Using model:", modelVersion);
  console.log("Final prompt:", finalPrompt);

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  const input = {
    prompt: finalPrompt,
    num_outputs: 1,
    aspect_ratio: aspectRatioValue,
    output_format: "jpg",
    output_quality: 100,
    seed: 17329,
    safety_tolerance: 6,
    prompt_upsampling: true,
    disable_safety_checker: true,
  };

  try {
    const output = await replicate.run(modelVersion, { input });
    const imageUrl = premium ? output : output[0];
    if (output && output.length > 0) {
      await saveToAirtable({ character, prompt, premium, aspect_ratio, style, imageUrl, email });
    }
    return sendResponse(200, { result: output });
  } catch (error) {
    console.error("Error generating image:", error);
    return sendResponse(500, { error: "An error occurred while processing the request", details: error.message });
  }
};
