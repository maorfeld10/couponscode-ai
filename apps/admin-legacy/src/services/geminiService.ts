import { GoogleGenAI } from "@google/genai";
import { Merchant } from "../data/mockData";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAboutMerchant = async (merchant: Partial<Merchant>) => {
  if (!merchant.name) {
    throw new Error("Merchant name is required for generation.");
  }

  const prompt = `
    You are an expert editorial commerce writer for TopCoupons.ai. 
    Your task is to generate polished, SEO-friendly, and highly useful "About Merchant" content for the store: ${merchant.name}.

    CONTEXT:
    - Merchant Name: ${merchant.name}
    - Homepage: ${merchant.homepage_url || 'Not provided'}
    - Category: ${merchant.category || 'Not provided'}
    - Short Description: ${merchant.short_description || 'Not provided'}
    - Existing Info: ${merchant.merchant_brief || 'Not provided'}

    REQUIRED STRUCTURE (Output as clean HTML):
    1. Intro Paragraph (2-4 sentences): Explain what the merchant is known for and key categories. Tone: Helpful and editorial.
    2. Smart Savings / Shopping Tips: A section with 3-5 bullet points on how to save (e.g., sales, loyalty programs, app/email signups).
    3. Top ${merchant.name} FAQs: 3-6 concise FAQs about shipping, returns, discounts, etc.
    4. About the Brand: A short closing section (2-4 sentences) about the company's history or values.

    FORMATTING RULES:
    - Use <h3> for section headings.
    - Use <p> for paragraphs.
    - Use <ul> and <li> for lists.
    - Use <strong> for emphasis.
    - DO NOT use markdown. Output ONLY valid HTML tags.
    - DO NOT include <html>, <body>, or <head> tags.
    - Keep it visually structured and readable.

    STYLE:
    - Natural, trustworthy, and authoritative.
    - SEO-friendly but not spammy.
    - Practical shopper guidance.
    - Avoid generic filler or fake claims.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating merchant content:", error);
    throw new Error("Failed to generate content with AI. Please try again.");
  }
};
