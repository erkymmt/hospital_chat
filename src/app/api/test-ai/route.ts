import OpenAI from 'openai';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello, how are you?" }],
  });

  return Response.json(response.choices[0].message);
}