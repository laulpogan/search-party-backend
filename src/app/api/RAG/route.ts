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
import { text } from 'stream/consumers';
import OpenAI from 'openai';
import { usePathname } from 'next/navigation';
import fs from 'fs';
import axios from 'axios';

import { Readable } from "stream";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const path = require('path');


const loader = new JSONLoader(
  "src/data/person.json",
  [
      "/missing_person",
      "/personal_information",
      "/full_name",
      "/date_of_birth",
      "/age",
      "/gender",
      "/physical_description",
      "/height",
      "/weight",
      "/hair_color",
      "/eye_color",
      "/distinguishing_features",
      "/last_seen_details",
      "/date_last_seen",
      "/time_last_seen",
      "/location_last_seen",
      "/circumstances",
      "/clothing_and_belongings",
      "/clothing_description",
      "/belongings"
    ],
);

export const dynamic = 'force-dynamic'

/**
* Basic memory formatter that stringifies and passes
* message history directly into the model.
*/
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};


async function StreamingDemoNode(input : string) {
  const speechFile = path.resolve(__dirname, './speech.mp3');
  /*
  const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: input
  }, 
  {
      responseType: 'arraybuffer', // Ensure we get the response as a buffer);
  });*/
  const response = await axios.post('https://api.openai.com/v1/audio/speech', {
      model: 'tts-1',
      voice: 'nova',
      input: input
  }, {
      responseType: 'arraybuffer', // Ensure we get the response as a buffer
      headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
      }
  });

  const audioBuffer = Buffer.from(response.data);
  fs.writeFileSync(speechFile, audioBuffer);


console.log(`Streaming response to ${speechFile}`);
console.log('Finished streaming');
}

const TEMPLATE = `You are a search and rescue operation officer giving out instructions based on information and context received. You
proceed and give out instructions to people from different sectors according to the state:
==============================
Context: {context}
==============================
Current conversation: {conversation_history}

Missing Person: {person}
Operation Officer:`;


export async function POST(req: Request) {
  try {
      // Extract the `messages` from the body of the request
      const { messages } = await req.json();

      const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

      const currentMessageContent = messages[messages.length - 1].content;

      const docs = await loader.load();

      // load a JSON object
      const textSplitter = new CharacterTextSplitter();

      const documents = await textSplitter.createDocuments([JSON.stringify(docs)]);

      const prompt = PromptTemplate.fromTemplate(TEMPLATE);

      const model = new ChatOpenAI({
          apiKey: process.env.OPENAI_API_KEY!,
          model: 'gpt-3.5-turbo',
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
              person: (input) => input.person,
              conversation_history: (input) => input.chat_history,
              context: () => formatDocumentsAsString(documents),
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
      const text = await new Response(stream).text();
      StreamingDemoNode(text);


      // Respond with the stream
      return new StreamingTextResponse(
          stream.pipeThrough(createStreamDataTransformer()),
      );

      
  } catch (e: any) {
      return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }

}
