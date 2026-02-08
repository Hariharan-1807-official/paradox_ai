import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // Allow any domain (Frontend) to connect
    methods: ['GET', 'POST']
}));
app.use(express.json());

if (!process.env.GROQ_API_KEY) {
    console.error("❌ ERROR: GROQ_API_KEY is missing in server/.env file!");
    console.error("Please create a .env file in the server directory with your key.");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "dummy_key_to_prevent_crash_on_init"
});

import { ragService } from './services/ragService.js';

// Initialize RAG
ragService.initialize().catch(console.error);

app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages are required and must be an array' });
    }

    // Get the last user message to search for context
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
    const userQuery = lastUserMessage ? lastUserMessage.content : "";

    // Use Advanced Vector Search
    const relevantChunks = await ragService.search(userQuery);
    const retrievedContext = relevantChunks.join('\n\n');

    console.log("Retrieved Context Chunks:", relevantChunks.length);

    // Inject Context into System Prompt
    // We modify the FIRST message if it is system, or prepend a new one.
    let finalMessages = [...messages];
    if (retrievedContext) {
        const systemInstruction = `
You are a domain-specific assistant. 
Use the following context to answer the user's question. 
If the answer is not in the context, relying on your general knowledge is okay but prefer the context.
CONTEXT:
${retrievedContext}
`;

        // Check if first message is system
        if (finalMessages[0].role === 'system') {
            finalMessages[0].content += systemInstruction;
        } else {
            finalMessages.unshift({ role: 'system', content: systemInstruction });
        }
    }

    // Set headers for SSE (Server-Sent Events) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream = await groq.chat.completions.create({
            messages: finalMessages,
            model: "llama-3.3-70b-versatile",
            stream: true,
            temperature: 0.7,
            max_completion_tokens: 1024,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                // Send data in SSE format
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Groq API Error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
