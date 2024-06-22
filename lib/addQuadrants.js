const sharp = require('sharp');

/**
 * Adds quadrants to an existing image.
 * 
 * @param {Buffer|string} imagePath - The path to the image file or a Buffer.
 * @returns {Promise<Buffer>} - A promise that resolves to the processed image buffer.
 */
async function addQuadrants(imagePath) {
  try {
    const image = sharp(imagePath);
    const { width, height } = await image.metadata();

    const quadrantWidth = width / 4;
    const quadrantHeight = height / 4;

    const svg = `
      <svg width="${width}" height="${height}">
        <line x1="${quadrantWidth}" y1="0" x2="${quadrantWidth}" y2="${height}" stroke="red" stroke-width="4"/>
        <line x1="${2 * quadrantWidth}" y1="0" x2="${2 * quadrantWidth}" y2="${height}" stroke="red" stroke-width="4"/>
        <line x1="${3 * quadrantWidth}" y1="0" x2="${3 * quadrantWidth}" y2="${height}" stroke="red" stroke-width="4"/>
        <line x1="0" y1="${quadrantHeight}" x2="${width}" y2="${quadrantHeight}" stroke="red" stroke-width="4"/>
        <line x1="0" y1="${2 * quadrantHeight}" x2="${width}" y2="${2 * quadrantHeight}" stroke="red" stroke-width="4"/>
        <line x1="0" y1="${3 * quadrantHeight}" x2="${width}" y2="${3 * quadrantHeight}" stroke="red" stroke-width="4"/>
        <text x="${quadrantWidth / 2}" y="${quadrantHeight / 2}" font-size="50" fill="blue">Q1</text>
        <text x="${quadrantWidth + quadrantWidth / 2}" y="${quadrantHeight / 2}" font-size="50" fill="blue">Q2</text>
        <text x="${2 * quadrantWidth + quadrantWidth / 2}" y="${quadrantHeight / 2}" font-size="50" fill="blue">Q3</text>
        <text x="${3 * quadrantWidth + quadrantWidth / 2}" y="${quadrantHeight / 2}" font-size="50" fill="blue">Q4</text>
        <text x="${quadrantWidth / 2}" y="${quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q5</text>
        <text x="${quadrantWidth + quadrantWidth / 2}" y="${quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q6</text>
        <text x="${2 * quadrantWidth + quadrantWidth / 2}" y="${quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q7</text>
        <text x="${3 * quadrantWidth + quadrantWidth / 2}" y="${quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q8</text>
        <text x="${quadrantWidth / 2}" y="${2 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q9</text>
        <text x="${quadrantWidth + quadrantWidth / 2}" y="${2 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q10</text>
        <text x="${2 * quadrantWidth + quadrantWidth / 2}" y="${2 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q11</text>
        <text x="${3 * quadrantWidth + quadrantWidth / 2}" y="${2 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q12</text>
        <text x="${quadrantWidth / 2}" y="${3 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q13</text>
        <text x="${quadrantWidth + quadrantWidth / 2}" y="${3 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q14</text>
        <text x="${2 * quadrantWidth + quadrantWidth / 2}" y="${3 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q15</text>
        <text x="${3 * quadrantWidth + quadrantWidth / 2}" y="${3 * quadrantHeight + quadrantHeight / 2}" font-size="50" fill="blue">Q16</text>
      </svg>
    `;

    const outputBuffer = await image
      .composite([{ input: Buffer.from(svg), blend: 'over' }])
      .png()
      .toBuffer();

    return outputBuffer;
  } catch (error) {
    console.error('Error adding quadrants to image:', error);
    throw error;
  }
}

module.exports = addQuadrants;
