import axios from 'axios';
import multer from 'multer';
import streamifier from 'streamifier';
import FormData from 'form-data';
import { supabase } from '../../lib/supabaseClient'; // Adjust the path as per your project structure

const upload = multer();

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, use multer instead
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: `Upload error: ${err.message}` });
      }

      try {
        const { userId, locationId } = req.body;

        if (!userId || !locationId) {
          return res.status(400).json({ error: 'User ID and Location ID are required' });
        }

        const audioBuffer = req.file.buffer;
        const audioStream = streamifier.createReadStream(audioBuffer);

        const formData = new FormData();
        formData.append('file', audioStream, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');
        console.log(process.env.OPENAI_API_KEY)
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders(), // Get headers from FormData instance
          },
        });

        const transcription = response.data.text;

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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
