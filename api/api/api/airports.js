const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q is required' });

  try {
    const r = await fetch(
      `https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(q)}`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
        }
      }
    );
    const data = await r.json();
    const results = (data.data || []).slice(0, 6).map(item => ({
      id: item.entityId || item.skyId,
      name: item.presentation?.title || item.entityId,
      subtitle: item.presentation?.subtitle || '',
      skyId: item.skyId
    }));
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
