import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Tutor endpoint
app.post('/api/tutor', async (req, res) => {
  try {
    const { message, persona, systemPrompt } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string.' });
      return;
    }

    const ai = getGenAI();

    if (!ai) {
      // Graceful academic fallback when API key is not configured
      const fallbackReply = `⚡ **Instant Solver (Offline Mode)**:\n\n` +
        `• **Topic**: ${message}\n` +
        `• **Breakdown**: For detailed AI-generated step-by-step proofs and live solutions, configure your \`GEMINI_API_KEY\` in the Settings menu.\n` +
        `• **Tip**: Explore our curated curriculum capsules and arcade mini-games to practice!`;
      res.json({ reply: fallbackReply });
      return;
    }

    const instruction =
      systemPrompt ||
      `You are ${persona || 'ATOMIC AI Study Tutor'}, a brilliant, encouraging, and ultra-fast STEM tutor for school students (NPS Class 7B curriculum). Give clear, step-by-step explanations, formatted formulas, and intuitive bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message,
      config: {
        systemInstruction: instruction,
      },
    });

    const reply = response.text || 'No response received from the tutor model.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error generating tutor response:', error);
    res.status(500).json({
      error: 'Failed to generate tutor response',
      message: error?.message || String(error),
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚛️ Atomic AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
