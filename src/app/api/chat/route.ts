import {
    Message as VercelChatMessage,
    StreamingTextResponse,
    createStreamDataTransformer
} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RunnableSequence } from '@langchain/core/runnables'
import { formatDocumentsAsString } from 'langchain/util/document';
import { CharacterTextSplitter } from 'langchain/text_splitter';

// const loader = new JSONLoader(
//     "src/data/question.json",
//     ["/state", "/code", "/nickname", "/website", "/admission_date", "/admission_number", "/capital_city", "/capital_url", "/population", "/population_rank", "/constitution_url", "/twitter_url"],
// );

export const dynamic = 'force-dynamic'

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `Ask the user the following questions one by one and store the answers in memory. 
Judge the user on these traits and come up with a conclusion at the end of the conversation. Conclusion should talk about each of the 5 traits on the user. 
After each question, if the user seems unsure or provides ambiguous answers break the flow of preset questions and ask an additional clarification question that adapts to previous answer

==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;


export async function POST(req: Request) {
    try {
        // Extract the `messages` from the body of the request
        const { messages } = await req.json();

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

        const currentMessageContent = messages[messages.length - 1].content;

        // const docs = await loader.load();

        // load a JSON object
        const textSplitter = new CharacterTextSplitter();
        const docs = await textSplitter.createDocuments([JSON.stringify({
            "Extroversion1"	:"I am the life of the party.",
            "Agreeableness1"	:"I don't talk a lot.",
            "Neuroticism1"	:"I feel comfortable around people.",
            "Openness1"	:"I keep in the background.",
            
        })]);

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
            model: 'gpt-4o',
            temperature: 0,
            streaming: true,
            verbose: true,
        });

        /**
       * Chat models stream message chunks rather than bytes, so this
       * output parser handles serialization and encoding.
       */
        const parser = new HttpResponseOutputParser();

        const chain = RunnableSequence.from([
            {
                question: (input) => input.question,
                chat_history: (input) => input.chat_history,
                context: () => formatDocumentsAsString(docs),
            },
            prompt,
            model,
            parser,
        ]);

        // Convert the response into a friendly text-stream
        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            question: currentMessageContent,
        });
        
        // Create a new stream that adds a delay between each chunk of data
        const delayedStream = new ReadableStream({
            async pull(controller) {
                for await (const chunk of stream) {
                    controller.enqueue(chunk);
                    // Introduce a delay of 1000 milliseconds (1 second) between chunks
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                controller.close();
            }
        });
        
        // Respond with the delayed stream
        return new StreamingTextResponse(
            delayedStream.pipeThrough(createStreamDataTransformer()),
        );
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}