import { supabase } from '../../lib/supabaseClient';
import generateSpeechAndUpload from "../../lib/audioStreaming";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content} = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }
    const uploadResult = await generateSpeechAndUpload(content);

    const fileURL = "https://wgqsvhcvbvxabkdrredc.supabase.co/storage/v1/object/public/audio/"+uploadResult.path;
    const { data, error } = await supabase
      .from('bulletins')
      .insert([{content: content, audio_link: fileURL}])
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Bulletin added successfully!', data: data[0] });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
