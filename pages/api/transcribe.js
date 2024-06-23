import { Configuration, OpenAIApi } from 'openai';
import multer from 'multer';
import fs from 'fs';
import nextConnect from 'next-connect';
import { supabase } from '../../lib/supabaseClient'; // Adjust the path as per your project structure

const upload = multer({ dest: 'uploads/' });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
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
  const filePath = req.file.path;

  try {
    const response = await openai.createTranscription(fs.createReadStream(filePath), {
      model: 'whisper-1', // Use appropriate Whisper model here
      language: 'en', // Set the language if necessary
    });

    const transcription = response.data.text;

    // Store transcription in Supabase
    const { data, error } = await supabase.from('transcriptions').insert([{ transcription }]);

    if (error) {
      throw new Error('Failed to insert transcription into Supabase');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to transcribe audio or store transcription' });
  } finally {
    fs.unlinkSync(filePath); // Clean up the uploaded file
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, use multer instead
  },
};

export default apiRoute;
