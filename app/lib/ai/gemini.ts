import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";



const MODEL = "gemini-1.5-flash"; // More stable than gemini-2.5-flash



export function getGeminiModel() {

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY?.trim();

  if (!apiKey) return null;



  const client = new GoogleGenerativeAI(apiKey);

  return client.getGenerativeModel({

    model: MODEL,

    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0.7,
    },
    // Add safety settings to reduce rejections
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],

  });

}


