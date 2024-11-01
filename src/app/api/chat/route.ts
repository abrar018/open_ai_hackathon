import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import path from 'path';
import express from 'express'; // If using Express for routing
//import { useState } from 'react';


export const dynamic = 'force-dynamic';
const router = express.Router();

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`; // Removed semicolon
};

const TEMPLATE = `
Ask the user the following questions one by one from the context provided. Do not provide any evaluation or analysis until all questions have been answered. After all questions have been answered, evaluate the combined responses based on the Big Five personality traits: Extraversion, Openness, Conscientiousness, Agreeableness, and Neuroticism. Assign a score from 1 to 10 for each trait by analyzing the user's responses as a whole.

==============================
Context: {context}
==============================
Current conversation:
{chat_history}

Instructions for Evaluation:
- **Extraversion**: Evaluate based on how social, outgoing, or energetic the responses appear.
- **Openness**: Evaluate based on signs of creativity, curiosity, or willingness to embrace new ideas.
- **Conscientiousness**: Evaluate based on indications of organization, responsibility, or dependability.
- **Agreeableness**: Evaluate based on expressions of kindness, cooperation, or empathy.
- **Neuroticism**: Evaluate based on signs of anxiety, emotional instability, or sensitivity.

For each response, **do not provide any evaluation**. Only after all questions have been answered, analyze all the responses in the context of these traits and provide a rating from 1 to 10 for each.

Example Response Format at the end:
{{
  "ratings": {{
      "Extraversion": 7,
      "Openness": 4,
      "Conscientiousness": 6,
      "Agreeableness": 8,
      "Neuroticism": 3
  }}
}}

user: {question}
assistant: ;`;
//const [jsonFileName, setJsonFileName] = useState<string | null>(null);

export async function POST(req: Request) {
    try {
      const sessionId = uuidv4();
      const { messages } = await req.json();
      const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
      const currentMessageContent = messages[messages.length - 1].content;
  
      // Load context data
      const textSplitter = new CharacterTextSplitter();
      const docs = await textSplitter.createDocuments([
        JSON.stringify({
          E1: 'I am the life of the party.',
        //   E2: "I don't talk a lot.",
        //   E3: 'I feel comfortable around people.',
        //   E4: 'I keep in the background.',
        }),
      ]);
  
      const prompt = PromptTemplate.fromTemplate(TEMPLATE);
      const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4o',
        temperature: 0,
        streaming: true,
        verbose: true,
      });
  
      const parser = new HttpResponseOutputParser();
      const chain = RunnableSequence.from([
        {
          question: (input: any) => input.question,
          chat_history: (input: any) => input.chat_history,
          context: () => formatDocumentsAsString(docs),
        },
        prompt,
        model,
        parser,
      ]);
  
      const stream = await chain.stream({
        chat_history: formattedPreviousMessages.join('\n'),
        question: currentMessageContent,
      });
  
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      let assistantResponse = '';
  
      (async () => {
        for await (const chunk of stream) {
          const textChunk = decoder.decode(chunk);
          assistantResponse += textChunk;
          await writer.write(encoder.encode(textChunk));
        }
        writer.close();
  
        let ratingsJson = '';
        let codeBlockMatch = assistantResponse.match(/```json\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch && codeBlockMatch[1]) {
          ratingsJson = codeBlockMatch[1];
        } else {
          const jsonMatch = assistantResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch && jsonMatch[0]) {
            ratingsJson = jsonMatch[0];
          }
        }
  
        if (ratingsJson) {
          try {
            const ratings = JSON.parse(ratingsJson);
            const fileName = 'ratings.json';
            fs.writeFileSync(fileName, JSON.stringify(ratings, null, 2));
            console.log(`Ratings saved successfully to ${fileName}`);
            //setJsonFileName(fileName);
          } catch (error) {
            console.error('Error parsing ratings:', error);
          }
        } else {
          console.error('Ratings not found in the assistant response.');
        }
      })();
  
      return new StreamingTextResponse(
        readable.pipeThrough(createStreamDataTransformer()),
      );
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: e.status ?? 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
  // GET route to serve ratings JSON based on sessionId
  router.get('/api/getRatings', (req, res) => {
    const sessionId = req.query.sessionId as string;
    const fileName = path.join(__dirname, `ratings_${sessionId}.json`);
  
    if (fs.existsSync(fileName)) {
      const ratingsData = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
      res.json(ratingsData);
    } else {
      res.status(404).json({ error: 'Ratings not found for this session.' });
    }
  });
  
  export default router;