
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Helper to sanitize and clean AI response for JSON parsing
const parseAIJson = (text: string | undefined) => {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("Failed to parse AI JSON, trying to recover text...", e);
    return null;
  }
};

const sanitize = (text: string, maxLength = 5000): string => {
  return (text || '').trim().slice(0, maxLength).replace(/[<>]/g, '');
};

// --- AUDIO UTILS FOR TTS ---
export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const generateSpeech = async (text: string, voiceName: 'Kore' | 'Puck' | 'Zephyr' = 'Kore') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Dis de manière calme et professionnelle : ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Speech Generation Error:", error);
    return null;
  }
};

export const getCyberAdvice = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: sanitize(prompt),
      config: {
        systemInstruction: `Tu es une IA experte en cybersécurité pédagogique. Réponds de manière claire, concise et éducative. 
        Si le sujet s'y prête (phishing, mots de passe, etc.), propose subtilement à la fin de ta réponse de tester les connaissances de l'utilisateur. 
        Si l'utilisateur accepte, je générerai un quiz via une autre fonction.`,
        temperature: 0.7,
      },
    });
    return response.text || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Erreur de communication avec l'IA. Vérifiez votre connexion.";
  }
};

export const generateContextualQuiz = async (topic: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Génère un mini-quiz de 3 questions sur le sujet : ${topic}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["topic", "questions"]
        }
      }
    });
    return parseAIJson(response.text);
  } catch (error) {
    console.error("Contextual Quiz Error:", error);
    return null;
  }
};

export const analyzeLink = async (url: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse de lien suspect : ${sanitize(url, 500)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING }
          },
          required: ["riskScore", "verdict", "reasons", "recommendation"]
        }
      }
    });
    return parseAIJson(response.text) || { riskScore: 0, verdict: "Inconnu", reasons: ["Analyse impossible"], recommendation: "Prudence." };
  } catch (error) {
    console.error("Link Analysis Error:", error);
    return { riskScore: 0, verdict: "Erreur d'analyse", reasons: ["Service indisponible"], recommendation: "Ne pas cliquer." };
  }
};

export const analyzeEmailContent = async (content: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse email suspect : ${sanitize(content, 2000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            threatScore: { type: Type.NUMBER },
            detectedTechniques: { type: Type.ARRAY, items: { type: Type.STRING } },
            analysis: { type: Type.STRING },
            isSafe: { type: Type.BOOLEAN }
          },
          required: ["riskLevel", "threatScore", "detectedTechniques", "analysis", "isSafe"]
        }
      }
    });
    return parseAIJson(response.text);
  } catch (error) {
    console.error("Email Analysis Error:", error);
    return null;
  }
};

export const analyzeDdosTraffic = async (trafficData: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse logs réseau : ${sanitize(trafficData, 1000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAttack: { type: Type.BOOLEAN },
            attackType: { type: Type.STRING },
            severity: { type: Type.STRING },
            pps: { type: Type.NUMBER },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            mitigationSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["isAttack", "attackType", "severity", "pps", "patterns", "mitigationSteps"]
        }
      }
    });
    return parseAIJson(response.text);
  } catch (error) {
    console.error("DDoS Analysis Error:", error);
    return null;
  }
};

export const analyzeLogs = async (logs: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audit de sécurité sur ces logs : ${sanitize(logs, 3000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            severity: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "threats", "severity", "recommendations"]
        }
      }
    });
    return parseAIJson(response.text);
  } catch (error) {
    console.error("Logs Audit Error:", error);
    return null;
  }
};

export const generateVideo = async (imageB64: string, prompt: string, aspectRatio: '16:9' | '9:16') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = imageB64.includes(',') ? imageB64.split(',')[1] : imageB64;
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Cyber security animation',
      image: { imageBytes: base64Data, mimeType: 'image/png' },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};
