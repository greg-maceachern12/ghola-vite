// netlify/functions/characterSD.js
const Replicate = require("replicate");
const Airtable = require("airtable");

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

// Function to save generation data to Airtable
const saveToAirtable = async (data) => {
  const { character, prompt, premium, aspect_ratio, style, imageUrl } = data;

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
              Premium: premium ? "Yes" : "No",
              "Aspect Ratio": aspect_ratio || "landscape",
              Style: style || "realistic",
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

  // Check for API key
  const API_KEY = process.env.REPLICATE_API_TOKEN;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API Key not configured" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
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
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };
    }

    let {
      prompt,
      premium,
      aspect_ratio = "landscape",
      style = "realistic",
      character,
    } = requestBody;
    console.log("Character:", character);
    console.log("Prompt:", prompt);
    console.log("Premium:", premium);
    console.log("Aspect ratio:", aspect_ratio);
    console.log("Style:", style);

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

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: API_KEY,
    });

    // Map the aspect_ratio parameter to actual ratios
    let aspectRatioValue;
    switch (aspect_ratio) {
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
      prompt_upsampling: true,
      disable_safety_checker: true,
    };

    const output = await replicate.run(modelVersion, { input });
    // If generation is successful, save to Airtable
    if (output && output.length > 0) {
      const imageUrl = premium ? output : output[0]; // Use output directly for premium, output[0] for non-premium
      // Save the generation data to Airtable
      console.log(imageUrl);
      await saveToAirtable({
        character,
        prompt,
        premium,
        aspect_ratio,
        style,
        imageUrl,
      });
    }

    // Return the image data
    return {
      statusCode: 200,
      body: JSON.stringify({ result: output }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  } catch (error) {
    console.error("Error generating image:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An error occurred while processing the request",
        details: error.message,
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }
};
