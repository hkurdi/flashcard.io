import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = (numFlashcards: number) => `
I want you to strictly act as a flashcard creator. Your job is to generate ${numFlashcards} flashcards for studying based on the topic I provide. 
For each flashcard, create a concise question, term, or concept on the front, and a detailed, accurate explanation or answer on the back.
Use bullet points or lists where appropriate to enhance clarity. Present the flashcards in the following JSON format:

{
    "flashcards": [
      {
        "front": "str",
        "back": "str"
      }
    ]
  }  

Generate exactly ${numFlashcards} flashcards.
`;

export async function POST(req: any) {
    const openAI = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    const { data, numFlashcards } = await req.json();

    try {
        const completion = await openAI.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt(numFlashcards) },
                { role: "user", content: data }
            ],
            model: "gpt-4",
        });

        const content = completion.choices[0]?.message?.content;
        console.log(completion);
        console.log("Raw OpenAI Response Content:", content);

        let flashcards;

        try {
            flashcards = JSON.parse(content || "");
        } catch (error) {
            console.error("Failed to parse OpenAI response as JSON:", error);
            return NextResponse.json({ error: "Failed to generate flashcards. Please try again." }, { status: 500 });
        }

        if (!flashcards || !flashcards.flashcards) {
            console.error("Invalid response format from OpenAI:", content);
            return NextResponse.json({ error: "Invalid response format from OpenAI." }, { status: 500 });
        }

        return NextResponse.json(flashcards.flashcards);

    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        return NextResponse.json({ error: "Failed to generate flashcards. Please try again." }, { status: 500 });
    }
}
