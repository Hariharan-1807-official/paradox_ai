import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, '../documents');

class RAGService {
    constructor() {
        this.documents = [];
        this.vectors = [];
        this.embedder = null;
        this.isReady = false;
    }

    async initialize() {
        console.log("Initializing RAG Service (Loading Embedding Model)...");
        // Use a small, fast model for local embeddings
        this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        await this.loadDocuments();
        this.isReady = true;
        console.log("RAG Service Ready.");
    }

    async loadDocuments() {
        if (!fs.existsSync(DOCUMENTS_DIR)) {
            fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
            return;
        }

        const files = fs.readdirSync(DOCUMENTS_DIR);
        this.documents = [];
        this.vectors = [];

        for (const file of files) {
            if (file.endsWith('.txt')) {
                const content = fs.readFileSync(path.join(DOCUMENTS_DIR, file), 'utf-8');
                const chunks = this.chunkText(content, 500, 100); // 500 chars, 100 overlap

                for (const chunk of chunks) {
                    const embedding = await this.generateEmbedding(chunk);
                    this.documents.push({ text: chunk, source: file });
                    this.vectors.push(embedding);
                }
            }
        }
        console.log(`Indexed ${this.documents.length} chunks from ${files.length} files.`);
    }

    chunkText(text, maxLength, overlap) {
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            let end = start + maxLength;
            if (end < text.length) {
                // Try to find a space to break at
                const lastSpace = text.lastIndexOf(' ', end);
                if (lastSpace > start) end = lastSpace;
            }
            chunks.push(text.slice(start, end).trim());
            start = end - overlap; // Move back for overlap
        }
        return chunks.filter(c => c.length > 0);
    }

    async generateEmbedding(text) {
        if (!this.embedder) throw new Error("Embedder not initialized");
        const output = await this.embedder(text, { pooling: 'mean', normalize: true });
        return output.data;
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
        }
        return dotProduct; // Vectors are already normalized
    }

    async search(query, topK = 3) {
        if (!this.isReady) await this.initialize();
        if (this.vectors.length === 0) return [];

        const queryVec = await this.generateEmbedding(query);

        const scored = this.vectors.map((vec, idx) => ({
            text: this.documents[idx].text,
            score: this.cosineSimilarity(queryVec, vec)
        }));

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .filter(item => item.score > 0.3) // Threshold
            .map(item => item.text);
    }
}

export const ragService = new RAGService();
