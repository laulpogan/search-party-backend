import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    console.log(req.body)
    const { id } = req.body ;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: `User with ID ${id} deleted successfully!`, data });
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
