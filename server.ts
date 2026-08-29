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

// Enable CORS for local dev, Codespaces, and external client connections
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

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
  res.json({ status: 'ok', timestamp: new Date().toISOString(), hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Tutor endpoint - Supporting 4 Agents: Vaibs, Avi, Arnie, Avans
app.post('/api/tutor', async (req, res) => {
  try {
    const { message, agent, studentName, studentGrade, systemPrompt } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string.' });
      return;
    }

    const ai = getGenAI();
    const activeAgent = (agent || 'vaibs').toLowerCase();
    const name = studentName || 'Student';
    const grade = studentGrade ? `Grade ${studentGrade}` : 'Grade 7';

    // Agent persona definitions
    const agentProfiles: Record<string, { name: string; title: string; instruction: string }> = {
      vaibs: {
        name: 'Vaibs',
        title: 'Study Master (Notes, Quizzes, Flashcards)',
        instruction: `You are "Vaibs", the Chief Study Strategist, Notes Master, and Quiz Specialist for school students (${grade}). 
You specialize in creating ultra-crisp revision notes, summary bullet points, custom flashcards, and quick concept quizzes.
Keep your tone enthusiastic, organized, and motivating. 
Format math cleanly using readable Unicode powers like x², y³, square roots √, and bold highlights. Never output messy raw unparsed LaTeX. Output clean bullet points, numbered lists, and interactive quiz/flashcard formats.`,
      },
      avi: {
        name: 'Avi',
        title: 'STEM & Languages Genius (Math, Science, Coding, English)',
        instruction: `You are "Avi", the STEM and Languages Genius for school students (${grade}). 
You specialize in Mathematics (algebra, geometry, calculus, arithmetic), Computer Science (Python, algorithms, web dev), Science (Physics, Chemistry, Biology), English grammar/literature, and global languages.
Provide step-by-step mathematical proofs with crystal clear breakdown:
- State the formula or identity clearly
- Show each calculation step explicitly
- Write exponents with Unicode (e.g. 67² = 4,489, (a+b)² = a² + 2ab + b²) rather than raw unparsed LaTeX
- Conclude with the final bold result.`,
      },
      arnie: {
        name: 'Arnie',
        title: 'Cosmic Explorer (Social Studies, GK, Art & Design)',
        instruction: `You are "Arnie", the World Explorer and Creative Curator for school students (${grade}). 
You specialize in Social Studies (History, Geography, Civics, World Civilizations), General Knowledge, space trivia, Art & Design principles, visual creativity, and cultural facts.
Explain historical events like an epic story, unpack geographic phenomena with clarity, and share fun trivia facts that make studying unforgettable!`,
      },
      avans: {
        name: 'Avans',
        title: 'Logic & Riddle Master (Critical Thinking & Puzzles)',
        instruction: `You are "Avans", the Master of Logic, Riddles, and Brain Workouts for school students (${grade}). 
You specialize in logical deduction, algorithmic thinking, number patterns, word puzzles, chess tactics, and critical reasoning.
Break down logic problems step by step, challenge the student with thought-provoking questions, and guide them to the "aha!" moment!`,
      },
    };

    const selectedProfile = agentProfiles[activeAgent] || agentProfiles.vaibs;

    if (!ai) {
      // Graceful offline fallback
      let fallbackText = `⚡ **${selectedProfile.name} (${selectedProfile.title})**:\n\n` +
        `Hello **${name}**! You asked about: **${message}** for ${grade}.\n\n` +
        `• **Step-by-Step Guide**: When connected to Gemini AI (configure \`GEMINI_API_KEY\` in your \`.env\` file or project settings), I provide live generative solutions, practice quizzes, and interactive proofs.\n` +
        `• **Pro Tip**: Try asking me to explain an algebraic identity like (a + b)² = a² + 2ab + b² or calculate exponents!`;

      res.json({ reply: fallbackText, agent: selectedProfile.name });
      return;
    }

    const instruction =
      systemPrompt ||
      `${selectedProfile.instruction}
Student Name: ${name}
Target Grade: ${grade}
Format math with clean Unicode (e.g. 60² = 3,600, 2 × 60 × 7 = 840, 7² = 49, Total = 4,489). Avoid raw LaTeX symbols like dollar signs or \\mathbf. Always provide an easy-to-read, high-contrast, structured response.`;

    let reply = '';
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: message,
          config: {
            systemInstruction: instruction,
          },
        });
        if (response && response.text) {
          reply = response.text;
          break;
        }
      } catch (modelErr) {
        console.warn(`Model ${modelName} attempt failed, trying next fallback:`, modelErr);
      }
    }

    if (!reply) {
      reply = `I processed your request regarding "${message}". Here is the structured breakdown for ${grade}:\n\n` +
        `1. **Concept Definition**: Understand the foundational properties.\n` +
        `2. **Step-by-Step Solution**: Apply inverse operations and simplify each side.\n` +
        `3. **Verification**: Check by substituting results back into the equation.`;
    }

    res.json({ reply, agent: selectedProfile.name });
  } catch (error: any) {
    console.error('Error generating AI Agent response:', error);
    res.status(500).json({
      error: 'Failed to generate agent response',
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
