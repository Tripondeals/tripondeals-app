const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { from, to, date, adults = 1, children = 0, cabinClass = 'economy', debug } = req.query;

  // DEBUG MODE - show raw autocomplete response
  if (debug) {
    try {
      const r = await fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(from || 'SEA')}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      });
      const d = await r.json();
      return res.status(200).json({ rawAutocomplete: d });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (!from || !to || !date) return res.status(400).json({ error: 'from, to and date required' });

  try {
    // Get entity IDs from autocomplete
    const [oRes, dRes] = await Promise.all([
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(from)}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      }),
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(to)}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      })
    ]);

    const [oData, dData] = await Promise.all([oRes.json(), dRes.json()]);

    const oItem = (oData.data || [])[0];
    const dItem = (dData.data || [])[0];

    if (!oItem || !dItem) {
      return res.status(200).json({
        itineraries: [], count: 0,
        message: 'Airport lookup failed',
        fromResult: oData,
        toResult: dData
      });
    }

    const fromEntityId = oItem.entityId;
    const toEntityId = dItem.entityId;
    const fromSkyId = oItem.skyId;
    const toSkyId = dItem.skyId;

    // Search flights
    const searchUrl = `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${fromEntityId}&toEntityId=${toEntityId}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`;

    const sRes = await fetch(searchUrl, {
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
    });
    const sData = await sRes.json();

    if (!sData?.data?.itineraries?.length) {
      return res.status(200).json({
        itineraries: [], count: 0,
        message: 'No flights found',
        debug: {
          fromEntityId, toEntityId, fromSkyId, toSkyId,
          fromCity: oItem.presentation?.title,
          toCity: dItem.presentation?.title,
          apiStatus: sData?.status,
          apiMessage: sData?.message,
          searchUrl
        }
      });
    }

    const itineraries = sData.data.itineraries.slice(0, 12).map(it => {
      const leg = it.legs?.[0];
      return {
        id: it.id,
        price: Math.round(it.price?.raw || 0),
        priceFormatted: it.price?.formatted || '$' + Math.round(it.price?.raw || 0),
        airline: leg?.carriers?.marketing?.[0]?.name || 'Unknown',
        airlineCode: leg?.carriers?.marketing?.[0]?.alternateId || '??',
        from: leg?.origin?.displayCode || fromSkyId,
        to: leg?.destination?.displayCode || toSkyId,
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

    return res.status(200).json({ itineraries, count: itineraries.length });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
