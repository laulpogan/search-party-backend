import { Configuration, OpenAIApi } from 'openai';
import multer from 'multer';
import nextConnect from 'next-connect';
import streamifier from 'streamifier';
import { supabase } from '../../lib/supabaseClient'; // Adjust the path as per your project structure

const upload = multer();

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

apiRoute.use(upload.single('audio'));

apiRoute.post(async (req, res) => {
  try {
    const { userId, locationId } = req.body;
    
    // if (!userId || !locationId) {
    //   return res.status(400).json({ error: 'User ID and Location ID are required' });
    // }

    const audioBuffer = req.file.buffer;
    const audioStream = streamifier.createReadStream(audioBuffer);

    const response = await openai.createTranscription(audioStream, {
      model: 'whisper-1', // Use the appropriate Whisper model here
      language: 'en', // Set the language if necessary
    });

    const transcription = response.data;

    // Store transcription in Supabase with userId and locationId
    const { data, error } = await supabase.from('data').insert([{ data: transcription, user: userId, location: locationId }]);

    if (error) {
      throw new Error('Failed to insert transcription into Supabase');
    }

    res.status(200).json({ success: true, transcription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to transcribe audio or store transcription' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, use multer instead
  },
};

export default apiRoute;
