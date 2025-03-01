# Ghola - Character Visualization

Ghola is a web application that brings fictional characters to life through AI-generated images. Users can input a character name, and the app will generate a detailed visual representation based on the character's description.

## Features

- **Character Visualization**: Input any character name from books, movies, or other media to generate an AI-powered visual representation
- **Rate Limiting**: Built-in rate limiting to prevent abuse (5 requests per 5 minutes)
- **Responsive Design**: Works beautifully on all device sizes
- **Fast Performance**: Built with Vite.js and optimized for quick loading and response times

## Tech Stack

- **Frontend**: React.js, Vite.js, Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **APIs**:
  - OpenAI API (GPT-4o mini) for character description generation
  - Replicate API (Flux Schnell model) for image generation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Netlify CLI (for local development)
- OpenAI API key
- Replicate API token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ghola.git
   cd ghola
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your API keys.

4. Start the development server:
   ```bash
   npm run netlify:dev
   ```
   This will start the Vite dev server along with Netlify Functions.

5. Open your browser and navigate to http://localhost:8888

## Deployment

The application is configured for easy deployment to Netlify:

1. Push your code to a GitHub repository

2. Connect the repository to Netlify

3. Set up the environment variables in the Netlify dashboard:
   - `OPENAI_API_KEY`
   - `REPLICATE_API_TOKEN`

4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for providing the GPT API
- [Replicate](https://replicate.com/) for the image generation models
- [Vite.js](https://vitejs.dev/) for the blazing fast frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Netlify](https://netlify.com/) for hosting and serverless functions