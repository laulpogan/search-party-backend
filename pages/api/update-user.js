import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id, name, location } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (location) updates.location = location;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: `User with ID ${id} updated successfully!`, user: data[0] });
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
