import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id, name, north, south, east, west, southeast, northeast, southwest, northwest, coords, is_searched } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (north) updates.north = north;
    if (south) updates.south = south;
    if (east) updates.east = east;      
    if (west) updates.west = west;  
    if (southeast) updates.southeast = southeast;
    if (northeast) updates.northeast = northeast;
    if (southwest) updates.southwest = southwest;
    if (northwest) updates.northwest = northwest;
    if (coords) updates.coords = coords;
    if (is_searched) updates.is_searched = is_searched;

    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: `Location with ID ${id} updated successfully!`, location: data[0] });
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
