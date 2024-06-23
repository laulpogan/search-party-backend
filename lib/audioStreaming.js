import axios from 'axios';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';


async function streamAudioToSupabase(audioBuffer, fileName) {
  // Upload the audio data to Supabase storage
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
  const response = await axios.post(
    'https://api.openai.com/v1/audio/speech',
    {
      model: 'tts-1',
      voice: 'nova',
      input: input,
    },
    {
      responseType: 'arraybuffer', // Ensure we get the response as a buffer
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const audioBuffer = Buffer.from(response.data);
  const fileName = `transcribed-audio-${Date.now()}`;
  return await streamAudioToSupabase(audioBuffer, fileName);
}

export default generateSpeechAndUpload;