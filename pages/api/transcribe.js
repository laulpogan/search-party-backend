import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import axios from 'axios'; // Import Axios

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

        try {
          // Make request to OpenAI for transcription
          const openaiApiKey = 'your-openai-api-key'; // Replace with your OpenAI API key
          const openaiApiUrl = 'https://api.openai.com/v1/audio/transcriptions';
          
          const formData = new FormData();
          formData.append('file', fs.createReadStream(path));

          const response = await axios.post(openaiApiUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${openaiApiKey}`,
            },
          });

          if (response.data && response.data.transcription) {
            const { transcription } = response.data.transcription;

            // Store transcription in Supabase
            const { data, error } = await supabase.from('transcriptions').insert([
              { text: transcription },
            ]);

            if (error) {
              throw new Error(`Failed to store transcription: ${error.message}`);
            }

            res.status(200).json({ success: true });
          } else {
            throw new Error('Failed to transcribe audio');
          }
        } catch (error) {
          console.error('Error processing transcription:', error);
          res.status(500).json({ success: false, error: error.message });
        } finally {
          // Clean up uploaded file if necessary
          fs.unlinkSync(path);
        }
      });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
