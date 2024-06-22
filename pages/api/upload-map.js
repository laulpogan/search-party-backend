import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import multiparty from 'multiparty';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle it manually
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Failed to parse form data' });
      }

      const file = files.file?.[0];
      if (!file) {
        return res.status(400).json({ error: 'No file received.' });
      }

      const buffer = await fs.promises.readFile(file.path);
      const filename = Date.now() + '-' + file.originalFilename.replace(/\s+/g, '_');
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

      try {
        // Write the file to the uploads directory
        await writeFile(uploadPath, buffer);

        // Return success message
        return res.status(201).json({ message: 'File uploaded successfully', filename });
      } catch (error) {
        console.log('Error occurred:', error);
        return res.status(500).json({ message: 'Failed to save file', error });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
