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

// Function to send email to Loops.so
const sendToLoops = async (email, premium) => {
  if (!email || email === "not-entered") return false;

  const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
  if (!LOOPS_API_KEY) {
    console.error("Loops API key not configured");
    return false;
  }

  try {
    // First try to find if contact exists
    const findResponse = await fetch(`https://app.loops.so/api/v1/contacts/find?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const contactData = {
      email,
      userGroup: "Ghola Users",
      source: "Ghola Web App Signup",
      subscribed: "yes",
      premium: premium
    };

    if (findResponse.status === 200) {
      // Contact exists, update it
      const updateResponse = await fetch("https://app.loops.so/api/v1/contacts/update", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${LOOPS_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactData)
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || "Failed to update contact in Loops.so");
      }
    } else {
      // Contact doesn't exist, create it
      const createResponse = await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOOPS_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactData)
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.message || "Failed to create contact in Loops.so");
      }
    }

    console.log("Successfully synced contact with Loops.so");
    return true;
  } catch (error) {
    console.error("Error sending to Loops.so:", error);
    return false;
  }
};

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
    // modelVersion = "black-forest-labs/flux-1.1-pro";
    modelVersion = "black-forest-labs/flux-schnell";
    finalPrompt = prompt;
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
    console.log(output)
    const imageUrl = output[0];

    if (output && output.length > 0) {
      await saveToAirtable({ character, prompt, premium, aspect_ratio, style, imageUrl, email });
      await sendToLoops(email, premium);
    }
    return sendResponse(200, { result: output });
  } catch (error) {
    console.error("Error generating image:", error);
    return sendResponse(500, { error: "An error occurred while processing the request", details: error.message });
  }
};
