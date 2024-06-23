import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content} = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const { data, error } = await supabase
      .from('bulletins')
      .insert([{content}])
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Bulletin added successfully!', data: data[0] });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
