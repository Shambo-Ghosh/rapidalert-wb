import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "mock-key");

export async function POST(req: Request) {
  try {
    const { crisisType, severity, description } = await req.json();

    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY === "mock-gemini-key" || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      // Return mock response for demo mode
      return NextResponse.json({
        immediateActions: [
          "Evacuate the immediate area safely.",
          "Alert nearby personnel and guests.",
          "Wait for emergency services to arrive.",
          "Do not attempt to resolve the crisis yourself if unsafe.",
          "Keep communication lines open."
        ],
        teamToAlert: "General Response Team",
        estimatedResponseTime: "5-10 minutes",
        riskLevel: severity >= 4 ? "Critical" : severity === 3 ? "Medium" : "Low",
        additionalNotes: "Mock analysis generated in demo mode."
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an emergency response coordinator in West Bengal, India. Analyze this incident:
Type: ${crisisType}
Severity: ${severity}/5
Description: ${description}

Respond strictly in valid JSON format with the following keys:
- "immediateActions": an array of 5 actionable strings/steps
- "teamToAlert": a string indicating the responsible team (e.g., Fire Brigade, Medical Response Team)
- "estimatedResponseTime": a string (e.g., "5-10 mins")
- "riskLevel": a string (Critical, High, Medium, Low)
- "additionalNotes": a brief string with any extra advice.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON safely
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
    
    const analysis = JSON.parse(jsonStr);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to analyze incident" }, { status: 500 });
  }
}
