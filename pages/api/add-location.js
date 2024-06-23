import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, coords } = req.body;

    if (!name || !coords) {
      return res.status(400).json({ error: 'Name and coordinates are required' });
    }

    const { data, error } = await supabase
      .from('locations')
      .insert([{ name, coords}])
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Location added successfully!', data: data[0] });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
