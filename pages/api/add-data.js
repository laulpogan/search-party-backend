import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user, location, data } = req.body;

    if (!user || !location || !data) {
      return res.status(400).json({ error: 'User, location, and data are required' });
    }

    const { data: insertedData, error } = await supabase
      .from('data')
      .insert([{ user, location, data }])
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Data added successfully!', data: insertedData[0] });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
