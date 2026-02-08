import { CONFIG } from "../config";

// We no longer need the direct SDK here, but we will keep the explicit API Key handling 
// if we want to pass it to the server (optional, but good for this transition).
// For now, we assume the server has the key or we send it.

export const createGroqClient = (apiKey) => {
    // This is now just a placeholder or state holder if needed.
    return { apiKey };
};

export const streamChatCompletion = async (client, messages, userName, onChunk, onComplete, onError) => {
    try {
        const systemMessage = { role: "system", content: CONFIG.SYSTEM_PROMPT };

        // Inject User Identity
        if (userName) {
            systemMessage.content += `\n\nUser's Name: ${userName}. Address them by their name occasionally.`;
        }

        const fullMessageList = [systemMessage, ...messages];

        let response;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Optional: Send key if we want the server to use the user's key
                    // 'x-api-key': client.apiKey 
                },
                body: JSON.stringify({
                    messages: fullMessageList
                })
            });
        } catch (networkError) {
            throw new Error("Cannot connect to Paradox Server. Is the backend running? (cd server && npm start)");
        }

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const dataStr = trimmed.replace('data: ', '');
                if (dataStr === '[DONE]') {
                    onComplete();
                    return;
                }

                try {
                    const data = JSON.parse(dataStr);
                    if (data.error) throw new Error(data.error);
                    if (data.content) {
                        onChunk(data.content);
                    }
                } catch (e) {
                    console.error("Error parsing SSE JSON", e);
                }
            }
        }

    } catch (error) {
        console.error("Error in streamChatCompletion:", error);
        if (onError) onError(error);
    }
};
