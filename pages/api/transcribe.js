import multer from 'multer';
import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { resolve } from 'path';
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
  if (req.method === 'POST') {
    upload.single('audio')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      } else if (err) {
        console.error('Other error:', err);
        return res.status(500).json({ error: 'Something went wrong' });
      }

      const { path } = resolve(__dirname, './speech.mp3')
      try {
        const openAiResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', {
          file: fs.createReadStream(path),
          model: 'whisper-1', // Replace with your specific model
        })
        }catch(error){    
            
            console.error('Error processing transcription:', error);
            res.status(500).json({ success: false, error: error.message });
            };

        const transcription = openAiResponse.data.text;
        
        try {
            const { data: transcriptionData, error: transcriptionError } = await supabase
            .from('audio')
            .insert([{ transcription }]);
    } catch (error) {
        console.error('Upload error:', uploadError);
        throw uploadError;
        }

        if (error) {
          throw new Error(`Failed to store transcription: ${error.message}`);
        }

        fs.unlinkSync(path); // Clean up uploaded file if necessary

        res.status(200).json({ success: true, transcription });
      });
    }
   else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
