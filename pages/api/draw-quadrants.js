import multiparty from 'multiparty';
import path from 'path';
import fs, { mkdir, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import addQuadrants from '../../lib/addQuadrants';

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
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
      const mapDir = path.join(process.cwd(), 'public/maps');
      const mapPath = path.join(process.cwd(), 'public/maps', filename);

      try {
         // Ensure the upload directory exists
        await mkdir(uploadDir, { recursive: true },  (err) => err && console.error(err));
         await mkdir(mapDir, { recursive: true },  (err) => err && console.error(err));

        // Write the file to the uploads directory
        await writeFile(uploadPath, buffer);

        // Add quadrants to the image
        const processedBuffer = await addQuadrants(uploadPath);
        await writeFile(mapPath, processedBuffer);

        // Clean up the uploaded file
        await fs.unlinkSync(uploadPath);
        // Return the processed image
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(processedBuffer);
      } catch (error) {
        console.log('Error occurred:', error);
        return res.status(500).json({ message: 'Failed to process image', error });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
