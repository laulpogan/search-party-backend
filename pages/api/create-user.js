import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins, adjust as needed
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'POST') {
    const name = req.body.name;
    const { data, error } = await supabase
    .from('users')
    .insert([
      { name: name},
    ])
    .select()
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
