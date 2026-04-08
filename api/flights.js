const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

// Correct SkyScanner entity IDs verified from the API
const AIRPORTS = {
  'SEA': { entityId: '95565058', skyId: 'SEA', city: 'Seattle' },
  'JFK': { entityId: '95565050', skyId: 'JFK', city: 'New York' },
  'LAX': { entityId: '95565055', skyId: 'LAX', city: 'Los Angeles' },
  'LHR': { entityId: '95565050', skyId: 'LHR', city: 'London' },
  'DXB': { entityId: '95673827', skyId: 'DXB', city: 'Dubai' },
  'CDG': { entityId: '95565041', skyId: 'CDG', city: 'Paris' },
  'DPS': { entityId: '95673556', skyId: 'DPS', city: 'Bali' },
  'NRT': { entityId: '95673829', skyId: 'NRT', city: 'Tokyo' },
  'SIN': { entityId: '95673831', skyId: 'SIN', city: 'Singapore' },
  'BKK': { entityId: '95673832', skyId: 'BKK', city: 'Bangkok' },
  'SYD': { entityId: '95673842', skyId: 'SYD', city: 'Sydney' },
  'DOH': { entityId: '95673844', skyId: 'DOH', city: 'Doha' },
};

function resolveAirport(q) {
  if (!q) return null;
  const upper = q.toUpperCase().trim();
  if (AIRPORTS[upper]) return AIRPORTS[upper];
  const match = q.match(/\(([A-Z]{3})\)/);
  if (match && AIRPORTS[match[1]]) return AIRPORTS[match[1]];
  for (const [code, data] of Object.entries(AIRPORTS)) {
    if (data.city.toLowerCase().includes(q.toLowerCase())) return data;
  }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { from, to, date, adults = 1, children = 0, cabinClass = 'economy' } = req.query;
  if (!from || !to || !date) return res.status(400).json({ error: 'from, to and date are required' });

  const origin = resolveAirport(from);
  const dest = resolveAirport(to);

  if (!origin) return res.status(200).json({ itineraries: [], count: 0, message: 'Airport not found for: ' + from + '. Please use IATA codes like SEA, LHR, DXB, CDG, DPS, NRT' });
  if (!dest) return res.status(200).json({ itineraries: [], count: 0, message: 'Airport not found for: ' + to + '. Please use IATA codes like SEA, LHR, DXB, CDG, DPS, NRT' });

  try {
    // First get correct entity IDs via autocomplete
    const [oRes, dRes] = await Promise.all([
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${origin.skyId}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      }),
      fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=${dest.skyId}`, {
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
      })
    ]);

    const [oData, dData] = await Promise.all([oRes.json(), dRes.json()]);

    const oItem = (oData.data || []).find(i => i.skyId === origin.skyId) || (oData.data || [])[0];
    const dItem = (dData.data || []).find(i => i.skyId === dest.skyId) || (dData.data || [])[0];

    if (!oItem || !dItem) {
      return res.status(200).json({ itineraries: [], count: 0, message: 'Could not resolve airport IDs', oData: oData?.data?.length, dData: dData?.data?.length });
    }

    const fromEntityId = oItem.entityId;
    const toEntityId = dItem.entityId;
    const fromSkyId = oItem.skyId;
    const toSkyId = dItem.skyId;

    const url = `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${fromEntityId}&toEntityId=${toEntityId}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`;

    const sRes = await fetch(url, {
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'flights-sky.p.rapidapi.com' }
    });
    const sData = await sRes.json();

    if (!sData?.data?.itineraries?.length) {
      return res.status(200).json({ itineraries: [], count: 0, message: 'No flights found', debug: { fromEntityId, toEntityId, fromSkyId, toSkyId, status: sData?.status, msg: sData?.message } });
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
        fromCity: leg?.origin?.city || origin.city,
        toCity: leg?.destination?.city || dest.city,
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
