
import { GoogleGenAI, Type } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        role: {
            type: Type.STRING,
            description: "The persona or job title the AI should adopt, e.g., 'Marketing Manager', 'Senior Developer'."
        },
        goal: {
            type: Type.STRING,
            description: "The primary objective or what the user wants to achieve with the prompt."
        },
        tone: {
            type: Type.STRING,
            description: "The desired tone of the output, e.g., 'Professional and persuasive', 'Friendly and casual'."
        },
        format: {
            type: Type.STRING,
            description: "The structure of the desired output, e.g., 'List of ideas', 'JSON object', 'Email draft'."
        },
        constraints: {
            type: Type.ARRAY,
            description: "A list of limitations or rules to follow, e.g., 'Max 500 words', 'Do not mention competitors'.",
            items: {
                type: Type.STRING
            }
        },
        language: {
            type: Type.STRING,
            description: "The desired output language, e.g., 'English', 'Farsi and English'."
        }
    },
    required: ["role", "goal", "tone", "format"]
};

const systemInstruction = `You are an expert system that converts natural language user requests into a structured JSON object. Analyze the user's prompt and map its components to the provided JSON schema. The goal is to create a detailed, machine-readable prompt for another AI model. Infer the fields based on the user's intent. If a field is not specified, make a reasonable assumption based on the context. For example, if the user asks for "blog post ideas", the format should be "List of titles with short descriptions".`;

export const generateJsonFromPrompt = async (naturalPrompt: string): Promise<object> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: naturalPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate JSON from prompt.");
    }
};
