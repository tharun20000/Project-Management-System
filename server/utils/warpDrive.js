import { GoogleGenAI, Type } from "@google/genai";

export const generateProjectScaffold = async (prompt) => {
    // Initialize the Gemini client using the environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `You are an expert software architect and technical project manager. 
Given a high-level project description, break it down into a comprehensive, production-ready scaffold consisting of major 'Works' (milestones or components) and nested 'Tasks'. 
Be extremely detailed, ensuring realistic titles, actionable descriptions, severity/priority tags, and technical architecture risks. Minimum 4-6 Works, and 3-5 Tasks per Work.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            projectMeta: {
                type: Type.OBJECT,
                description: "Metadata for the overall project based on the prompt.",
                properties: {
                    desc: { type: Type.STRING, description: "A professional, fleshed-out description of the project." },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant technology stack and methodology tags (e.g., React, Stripe, Agile)." }
                }
            },
            works: {
                type: Type.ARRAY,
                description: "The major milestones or components of the project.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "The title of the work component (e.g., 'Authentication System', 'Database Design')." },
                        desc: { type: Type.STRING, description: "A detailed description of what this work component entails." },
                        priority: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "The priority of this component." },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific tech tags relevant to this component." },
                        tasks: {
                            type: Type.ARRAY,
                            description: "The indivual tasks required to complete this work component.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    task: { type: Type.STRING, description: "The actionable task title." },
                                    impact_risk: { type: Type.STRING, enum: ["Low", "Medium", "High", "Unknown"], description: "The technical risk or complexity associated with this task." }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        // The response text is guaranteed to match the JSON schema
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Warp Drive Generation Error:", error);
        throw new Error("Failed to generate project scaffold via AI.");
    }
};
