import multiparty from 'multiparty';
import path from 'path';
import { promises as fs } from 'fs';
import { supabase } from '../../lib/supabaseClient';
import addQuadrants from '../../lib/addQuadrants';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle it manually
  },
};

export default async function handler(req, res) {
  console.log('API route hit'); // Logging

  if (req.method === 'POST') {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Failed to parse form data' });
      }

      console.log('Form parsed'); // Logging

      const file = files.file?.[0];
      if (!file) {
        console.error('No file received');
        return res.status(400).json({ error: 'No file received.' });
      }

      console.log('File received:', file.originalFilename); // Logging

      const buffer = await fs.readFile(file.path);
      const filename = Date.now() + '-' + file.originalFilename.replace(/\s+/g, '_');

      try {
        // Upload the original image to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filename, buffer, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('Original image uploaded:', filename, data); // Logging

        const { publicURL: originalURL } = await supabase.storage.from('uploads').getPublicUrl(filename);
        console.log('Original image URL:', originalURL); // Logging

        // Add quadrants to the image
        const processedBuffer = await addQuadrants(buffer);

        // Upload the processed image to Supabase Storage
        const processedFilename = `processed-${filename}`;
        const { data: processedData, error: processedUploadError } = await supabase.storage
          .from('processed-uploads')
          .upload(processedFilename, processedBuffer, {
            cacheControl: '3600',
            upsert: false,
          });

        if (processedUploadError) {
          console.error('Processed upload error:', processedUploadError);
          throw processedUploadError;
        }

        console.log('Processed image uploaded:', processedFilename, processedData); // Logging

        const { publicURL: processedURL } = await supabase.storage.from('processed-uploads').getPublicUrl(processedFilename);
        console.log('Processed image URL:', processedURL); // Logging

        // Return the public URLs of the original and processed images
        res.status(200).json({
          message: 'File uploaded successfully',
          originalURL,
          processedURL,
        });
      } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({ message: 'Failed to process image', error });
      }
    });
  } else {
    console.error('Method not allowed:', req.method); // Logging
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
