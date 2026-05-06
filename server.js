import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Allow server to accept JSON data
app.use(express.static('public')); // Serve your HTML/CSS/JS files

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Route to process the document
app.post('/api/summarize', async (req, res) => {
    try {
        const { csvData } = req.body;
        
        if (!csvData) {
            return res.status(400).json({ error: "No CSV data provided" });
        }

        const prompt = `You are a data analyst. I am providing you with raw CSV data. Please read it, summarize the key findings, and give me 3 bullet-point insights.\n\nData:\n${csvData}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ summary: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process document" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));