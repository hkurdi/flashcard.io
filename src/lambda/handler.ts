import { APIGatewayEvent, Context, Callback } from "aws-lambda";
import OpenAI from "openai";

require('dotenv').config();

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

const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const { data, numFlashcards } = body;

        const completion = await openAI.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt(numFlashcards) },
                { role: "user", content: data }
            ],
            model: "gpt-4-turbo",
        });

        const content = completion.choices[0]?.message?.content;
        console.log("OpenAI Response:", content);

        let flashcards;
        try {
            flashcards = JSON.parse(content || "");
        } catch (error) {
            console.error("Failed to parse OpenAI response as JSON:", error);
            return callback(null, {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                },
                body: JSON.stringify({ error: "Failed to generate flashcards. Please try again." })
            });
        }

        if (!flashcards || !flashcards.flashcards) {
            console.error("Invalid response format from OpenAI:", content);
            return callback(null, {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                },
                body: JSON.stringify({ error: "Invalid response format from OpenAI." })
            });
        }

        return callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",  
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",  
            },
            body: JSON.stringify(flashcards.flashcards)
        });

    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        return callback(null, {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ error: "Failed to generate flashcards. Please try again." })
        });
    }
};
