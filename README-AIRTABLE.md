# Airtable Integration for Ghola

This document explains how to set up the Airtable integration for tracking character generations in Ghola.

## Setup Instructions

### 1. Airtable Base Information

The application is configured to use a specific Airtable base:
- Base ID: `appN0MeQnwQpbJEHr`
- Table Name: `GholaData`

This base should already be set up with the following fields:
- Character (Single line text)
- Prompt (Long text)
- Premium (Single select or Checkbox)
- Aspect Ratio (Single line text)
- Style (Single line text)
- Image URL (URL)
- Created At (Date & Time)
- Source (Single line text)

### 2. Get Your Airtable API Key

1. Go to your [Airtable account page](https://airtable.com/account)
2. Under the API section, create a Personal Access Token
3. Give it a name like "Ghola Integration"
4. Set appropriate permissions:
   - Make sure to include the `data.records:write` scope for the base with ID `appN0MeQnwQpbJEHr`
5. Copy the generated API key

### 3. Configure Environment Variables in Netlify

Add the following environment variable to your Netlify site:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variable:
   - `AIRTABLE_API_KEY`: Your Airtable API key

The base ID and table name are already configured in the code, but you can override them if needed:
   - `AIRTABLE_BASE_ID`: Your Airtable base ID (default is `appN0MeQnwQpbJEHr`)
   - `AIRTABLE_TABLE_NAME`: The name of your table (default is `GholaData`)

### 4. Install Dependencies

The integration uses the official Airtable SDK. Make sure to install it:

```bash
npm install airtable
```

### 5. Deploy Your Site

After configuring the environment variables and installing dependencies, deploy your site to Netlify.

## How It Works

When a character image is successfully generated:

1. The Netlify function `characterSD.js` captures the generation data
2. It creates a new record in your Airtable base with:
   - Character name
   - Prompt used
   - Premium status
   - Aspect ratio
   - Style
   - Generated image URL
   - Timestamp
   - Source (set to "Ghola Web App")

## Troubleshooting

If records aren't being created in Airtable:

1. Check the Netlify function logs for any errors
2. Verify that your API key is correct and has the necessary permissions
3. Ensure your Airtable table has the correct field names
4. Check that you have access to the Airtable base with ID `appN0MeQnwQpbJEHr`

## Airtable API Documentation

For more information on the Airtable API, visit:
https://airtable.com/appN0MeQnwQpbJEHr/api/docs 