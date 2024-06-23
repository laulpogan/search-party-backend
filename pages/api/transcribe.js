// pages/api/transcribe.js

import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { GPT } from '@openai/whisper-gpt';
import fs from 'fs';

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, `${uuidv4()}_${file.originalname}`);
    },
  }),
});

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);
const gpt = new GPT({/* your GPT configuration */});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, since we're using multer for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Process file upload
      upload.single('audio')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(500).json({ error: 'File upload failed' });
        } else if (err) {
          console.error('Other error:', err);
          return res.status(500).json({ error: 'Something went wrong' });
        }

        const { path } = req.file;

        // Example: Use Whisper GPT for transcription (replace with your actual GPT implementation)
        const transcription = await gpt.transcribeAudio(path);

        // Store transcription in Supabase
        const { data, error } = await supabase.from('transcriptions').insert([
          { text: transcription },
        ]);

        if (error) {
          throw new Error(`Failed to store transcription: ${error.message}`);
        }

        // Optional: Clean up uploaded file if necessary
        fs.unlinkSync(path);

        res.status(200).json({ success: true });
      });
    } catch (error) {
      console.error('Error processing transcription:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
