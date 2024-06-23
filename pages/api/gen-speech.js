import generateSpeechAndUpload from "../../lib/audioStreaming";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Only POST requests allowed' });
      return;
    }
  
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ message: 'Text input is required' });
        return;
      }
      console.log(text)

      const uploadResult = await generateSpeechAndUpload(text);
  
      res.status(200).json({ message: 'Audio uploaded successfully', data: uploadResult });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }