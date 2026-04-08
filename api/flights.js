const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { from, to, date, returnDate, adults = 1, children = 0, cabinClass = 'economy' } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ error: 'from, to and date are required' });
  }

  try {
    // Search for origin airport
    const originRes = await fetch(
      `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${encodeURIComponent(from)}&toEntityId=${encodeURIComponent(to)}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
        }
      }
    );

    const data = await originRes.json();

    if (!data || data.status === false) {
      return res.status(200).json({ itineraries: [], message: 'No flights found' });
    }

    const itineraries = (data.data?.itineraries || []).slice(0, 10).map(it => {
      const leg = it.legs?.[0];
      const segment = leg?.segments?.[0];
      return {
        id: it.id,
        price: it.price?.raw || 0,
        priceFormatted: it.price?.formatted || '$0',
        airline: segment?.operatingCarrier?.name || leg?.carriers?.marketing?.[0]?.name || 'Unknown',
        airlineCode: leg?.carriers?.marketing?.[0]?.alternateId || '??',
        from: leg?.origin?.displayCode || from,
        to: leg?.destination?.displayCode || to,
        fromCity: leg?.origin?.city || from,
        toCity: leg?.destination?.city || to,
        dep: leg?.departure?.slice(11, 16) || '',
        arr: leg?.arrival?.slice(11, 16) || '',
        depDate: leg?.departure?.slice(0, 10) || date,
        arrDate: leg?.arrival?.slice(0, 10) || date,
        duration: Math.floor((leg?.durationInMinutes || 0) / 60) + 'h ' + ((leg?.durationInMinutes || 0) % 60) + 'm',
        stops: leg?.stopCount || 0,
        stopCity: leg?.segments?.[1]?.origin?.displayCode || '',
        score: it.score || 0,
        tags: it.tags || []
      };
    });

    return res.status(200).json({ itineraries, count: itineraries.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
