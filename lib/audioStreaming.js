import axios from 'axios';
import OpenAI from 'openai';
import { supabase } from './supabaseClient';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

async function streamAudioToSupabase(audioBuffer, fileName) {
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(`audio/${fileName}.mp3`, audioBuffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error('Failed to upload audio to Supabase');
  }

  return data;
}

async function generateSpeechAndUpload(input) {

    const bearer = "Bearer " + "sk-proj-KdgN9p9UP47C9J2no2oET3BlbkFJDrdWXusqT3cSTguDvT0h"
  const response = await axios.post(
    'https://api.openai.com/v1/audio/speech',
    {
      model: 'tts-1',
      voice: 'nova',
      input: input,
    },
    {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(`OpenAI API request failed with status ${response.status}`);
  }

  const audioBuffer = Buffer.from(response.data);
  const fileName = `transcribed-audio-${Date.now()}`;
  return await streamAudioToSupabase(audioBuffer, fileName);
}

export default generateSpeechAndUpload;
