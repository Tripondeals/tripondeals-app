const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { from, to, date, adults = 1, children = 0, cabinClass = 'economy', test } = req.query;

  // TEST MODE - try all possible endpoint formats
  if (test) {
    const fromEntityId = '95673694'; // SEA
    const toEntityId = '95673506';   // DXB
    const testDate = '2026-05-15';
    const results = {};

    // Try endpoint 1: search-one-way
    try {
      const r1 = await fetch(
        `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${fromEntityId}&toEntityId=${toEntityId}&departDate=${testDate}&adults=1`,
        { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' } }
      );
      results.endpoint1_search_one_way = await r1.json();
    } catch(e) { results.endpoint1_error = e.message; }

    // Try endpoint 2: search-roundtrip
    try {
      const r2 = await fetch(
        `https://flights-sky.p.rapidapi.com/flights/search-roundtrip?fromEntityId=${fromEntityId}&toEntityId=${toEntityId}&departDate=${testDate}&returnDate=2026-05-22&adults=1`,
        { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' } }
      );
      results.endpoint2_search_roundtrip = await r2.json();
    } catch(e) { results.endpoint2_error = e.message; }

    // Try endpoint 3: search with skyId instead
    try {
      const r3 = await fetch(
        `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=SEA&toEntityId=DXB&departDate=${testDate}&adults=1`,
        { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' } }
      );
      results.endpoint3_skyId_codes = await r3.json();
    } catch(e) { results.endpoint3_error = e.message; }

    // Try endpoint 4: using CITY entityId
    try {
      const r4 = await fetch(
        `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=27538444&toEntityId=27545922&departDate=${testDate}&adults=1`,
        { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' } }
      );
      results.endpoint4_city_ids = await r4.json();
    } catch(e) { results.endpoint4_error = e.message; }

    return res.status(200).json(results);
  }

  if (!from || !to || !date) return res.status(400).json({ error: 'from, to and date required' });

  try {
    const [oRes, dRes] = await Promise.all([
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(from)}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      }),
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${encodeURIComponent(to)}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      })
    ]);

    const [oData, dData] = await Promise.all([oRes.json(), dRes.json()]);
    const oItem = (oData.data || []).find(i => i.navigation?.entityType === 'AIRPORT') || (oData.data || [])[0];
    const dItem = (dData.data || []).find(i => i.navigation?.entityType === 'AIRPORT') || (dData.data || [])[0];

    if (!oItem || !dItem) return res.status(200).json({ itineraries: [], count: 0, message: 'Airport not found' });

    const fromEntityId = oItem.navigation.entityId;
    const toEntityId = dItem.navigation.entityId;

    const sRes = await fetch(
      `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${fromEntityId}&toEntityId=${toEntityId}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`,
      { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' } }
    );
    const sData = await sRes.json();

    if (!sData?.data?.itineraries?.length) {
      return res.status(200).json({ itineraries: [], count: 0, message: 'No flights found', debug: { fromEntityId, toEntityId, apiStatus: sData?.status, apiMsg: sData?.message } });
    }

    const itineraries = sData.data.itineraries.slice(0, 12).map(it => {
      const leg = it.legs?.[0];
      return {
        id: it.id,
        price: Math.round(it.price?.raw || 0),
        priceFormatted: it.price?.formatted || '$' + Math.round(it.price?.raw || 0),
        airline: leg?.carriers?.marketing?.[0]?.name || 'Unknown',
        airlineCode: leg?.carriers?.marketing?.[0]?.alternateId || '??',
        from: leg?.origin?.displayCode || from,
        to: leg?.destination?.displayCode || to,
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
