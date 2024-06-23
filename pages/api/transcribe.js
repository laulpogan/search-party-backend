import multer from 'multer';
import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { resolve } from 'path';

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Enable CORS for all routes

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp/uploads'); // Use a temporary directory for uploads
    },
    filename: function (req, file, cb) {
      cb(null, `${uuidv4()}_${file.originalname}`);
    },
  }),
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, since we're using multer for file uploads
  },
};

async function handler(req, res) {
    console.log('req.method', req.method)
  if (req.method === 'POST') {
    upload.single('audio')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      } else if (err) {
        console.error('Other error:', err);
        return res.status(500).json({ error: 'Something went wrong' });
      }

      const { path } = req.file;
      try {
        const formData = new FormData();
        formData.append('audio', fs.createReadStream(path), {
          contentType: 'audio/x-wav', // Adjust MIME type if necessary
          name: 'audio.wav',
        });

        const openAiResponse = await axios.get('https://api.openai.com/v1/audio/transcriptions', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your OpenAI API key
          },
        });

        const transcription = openAiResponse.data.text;

        const { data: transcriptionData, error: transcriptionError } = await supabase
          .from('audio')
          .insert([{ transcription }]);

        if (transcriptionError) {
          throw new Error(`Failed to store transcription: ${transcriptionError.message}`);
        }

        fs.unlinkSync(path); // Clean up uploaded file if necessary

        res.status(200).json({ success: true, transcription });
      } catch (error) {
        console.error('Error processing transcription:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
