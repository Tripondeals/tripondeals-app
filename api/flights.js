const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { from, to, date, adults = 1, children = 0, cabinClass = 'economy' } = req.query;
  if (!from || !to || !date) {
    return res.status(400).json({ error: 'from, to and date are required' });
  }

  try {
    // Step 1: resolve origin sky ID
    const [originRes, destRes] = await Promise.all([
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(from)}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      }),
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(to)}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      })
    ]);

    const [originData, destData] = await Promise.all([originRes.json(), destRes.json()]);

    const originItem = (originData.data || [])[0];
    const destItem = (destData.data || [])[0];

    if (!originItem || !destItem) {
      return res.status(200).json({ itineraries: [], count: 0, message: 'Could not find airports for those cities' });
    }

    const fromId = originItem.entityId;
    const toId = destItem.entityId;
    const fromSky = originItem.skyId;
    const toSky = destItem.skyId;

    // Step 2: search flights
    const searchUrl = `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${fromId}&toEntityId=${toId}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`;

    const searchRes = await fetch(searchUrl, {
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
    });

    const searchData = await searchRes.json();

    if (!searchData || searchData.status === false || !searchData.data) {
      return res.status(200).json({ itineraries: [], count: 0, message: 'No flights found', debug: searchData });
    }

    const itineraries = (searchData.data.itineraries || []).slice(0, 12).map(it => {
      const leg = it.legs?.[0];
      const seg = leg?.segments?.[0];
      return {
        id: it.id,
        price: Math.round(it.price?.raw || 0),
        priceFormatted: it.price?.formatted || '$0',
        airline: leg?.carriers?.marketing?.[0]?.name || seg?.operatingCarrier?.name || 'Unknown',
        airlineCode: leg?.carriers?.marketing?.[0]?.alternateId || '??',
        from: leg?.origin?.displayCode || fromSky,
        to: leg?.destination?.displayCode || toSky,
        fromCity: leg?.origin?.city || from,
        toCity: leg?.destination?.city || to,
        dep: (leg?.departure || '').slice(11, 16),
        arr: (leg?.arrival || '').slice(11, 16),
        depDate: (leg?.departure || date).slice(0, 10),
        arrDate: (leg?.arrival || date).slice(0, 10),
        duration: Math.floor((leg?.durationInMinutes || 0) / 60) + 'h ' + ((leg?.durationInMinutes || 0) % 60) + 'm',
        stops: leg?.stopCount || 0,
        stopCity: leg?.segments?.[1]?.origin?.displayCode || '',
        tags: it.tags || []
      };
    });

    return res.status(200).json({ itineraries, count: itineraries.length, origin: originItem.presentation?.title, destination: destItem.presentation?.title });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
