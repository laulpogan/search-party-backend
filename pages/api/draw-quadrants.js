// pages/api/draw-quadrants.js
import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's default body parser
  },
};

const drawQuadrants = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Failed to parse form data' });
      return;
    }

    const file = files.file;
    const imagePath = file.filepath;

    try {
      // Read the uploaded image
      const image = sharp(imagePath);
      const { width, height } = await image.metadata();

      // Draw quadrants
      const svg = `
        <svg width="${width}" height="${height}">
          <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="red" stroke-width="4"/>
          <line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="red" stroke-width="4"/>
          <text x="${(3 * width) / 4}" y="${height / 4}" font-size="50" fill="blue">Q1</text>
          <text x="${width / 4}" y="${height / 4}" font-size="50" fill="blue">Q2</text>
          <text x="${width / 4}" y="${(3 * height) / 4}" font-size="50" fill="blue">Q3</text>
          <text x="${(3 * width) / 4}" y="${(3 * height) / 4}" font-size="50" fill="blue">Q4</text>
        </svg>
      `;

      // Composite the SVG onto the image
      const outputBuffer = await image
        .composite([{ input: Buffer.from(svg), blend: 'over' }])
        .toBuffer();

      res.setHeader('Content-Type', 'image/png');
      res.send(outputBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process image' });
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(imagePath);
    }
  });
};

export default drawQuadrants;
