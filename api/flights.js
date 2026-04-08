const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

// Major airports - entityId and skyId for Sky Scanner API
const AIRPORTS = {
  // USA
  'SEA': { entityId: '95565058', skyId: 'SEA', city: 'Seattle' },
  'JFK': { entityId: '95565058', skyId: 'JFK', city: 'New York' },
  'NYC': { entityId: '27537542', skyId: 'NYCA', city: 'New York' },
  'LAX': { entityId: '95565055', skyId: 'LAX', city: 'Los Angeles' },
  'ORD': { entityId: '95565049', skyId: 'ORD', city: 'Chicago' },
  'MIA': { entityId: '95565050', skyId: 'MIA', city: 'Miami' },
  'SFO': { entityId: '95565057', skyId: 'SFO', city: 'San Francisco' },
  'LAS': { entityId: '95565053', skyId: 'LAS', city: 'Las Vegas' },
  'BOS': { entityId: '95565044', skyId: 'BOS', city: 'Boston' },
  // UK
  'LHR': { entityId: '95565050', skyId: 'LHR', city: 'London' },
  'LGW': { entityId: '95565052', skyId: 'LGW', city: 'London Gatwick' },
  'LON': { entityId: '27544008', skyId: 'LONA', city: 'London' },
  'MAN': { entityId: '95565053', skyId: 'MAN', city: 'Manchester' },
  // UAE
  'DXB': { entityId: '95673827', skyId: 'DXB', city: 'Dubai' },
  'AUH': { entityId: '95673828', skyId: 'AUH', city: 'Abu Dhabi' },
  // ASIA
  'DPS': { entityId: '95673556', skyId: 'DPS', city: 'Bali' },
  'NRT': { entityId: '95673829', skyId: 'NRT', city: 'Tokyo' },
  'HND': { entityId: '95673830', skyId: 'HND', city: 'Tokyo Haneda' },
  'SIN': { entityId: '95673831', skyId: 'SIN', city: 'Singapore' },
  'BKK': { entityId: '95673832', skyId: 'BKK', city: 'Bangkok' },
  'HKG': { entityId: '95673833', skyId: 'HKG', city: 'Hong Kong' },
  'KUL': { entityId: '95673834', skyId: 'KUL', city: 'Kuala Lumpur' },
  'CGK': { entityId: '95673835', skyId: 'CGK', city: 'Jakarta' },
  'MNL': { entityId: '95673836', skyId: 'MNL', city: 'Manila' },
  'ICN': { entityId: '95673837', skyId: 'ICN', city: 'Seoul' },
  'PEK': { entityId: '95673838', skyId: 'PEK', city: 'Beijing' },
  'PVG': { entityId: '95673839', skyId: 'PVG', city: 'Shanghai' },
  'BOM': { entityId: '95673840', skyId: 'BOM', city: 'Mumbai' },
  'DEL': { entityId: '95673841', skyId: 'DEL', city: 'Delhi' },
  // EUROPE
  'CDG': { entityId: '95565041', skyId: 'CDG', city: 'Paris' },
  'PAR': { entityId: '27539733', skyId: 'PARA', city: 'Paris' },
  'AMS': { entityId: '95565043', skyId: 'AMS', city: 'Amsterdam' },
  'FRA': { entityId: '95565046', skyId: 'FRA', city: 'Frankfurt' },
  'MAD': { entityId: '95565054', skyId: 'MAD', city: 'Madrid' },
  'BCN': { entityId: '95565045', skyId: 'BCN', city: 'Barcelona' },
  'FCO': { entityId: '95565048', skyId: 'FCO', city: 'Rome' },
  'MXP': { entityId: '95565056', skyId: 'MXP', city: 'Milan' },
  'ZRH': { entityId: '95565059', skyId: 'ZRH', city: 'Zurich' },
  'VIE': { entityId: '95565060', skyId: 'VIE', city: 'Vienna' },
  'IST': { entityId: '95565061', skyId: 'IST', city: 'Istanbul' },
  'ATH': { entityId: '95565062', skyId: 'ATH', city: 'Athens' },
  // AUSTRALIA
  'SYD': { entityId: '95673842', skyId: 'SYD', city: 'Sydney' },
  'MEL': { entityId: '95673843', skyId: 'MEL', city: 'Melbourne' },
  // MIDDLE EAST
  'DOH': { entityId: '95673844', skyId: 'DOH', city: 'Doha' },
  'RUH': { entityId: '95673845', skyId: 'RUH', city: 'Riyadh' },
  // AFRICA
  'CAI': { entityId: '95673846', skyId: 'CAI', city: 'Cairo' },
  'JNB': { entityId: '95673847', skyId: 'JNB', city: 'Johannesburg' },
  // CANADA
  'YYZ': { entityId: '95565063', skyId: 'YYZ', city: 'Toronto' },
  'YVR': { entityId: '95565064', skyId: 'YVR', city: 'Vancouver' },
};

// Resolve city name or code to airport
function resolveAirport(query) {
  if (!query) return null;
  const q = query.toUpperCase().trim();
  // Direct IATA code match
  if (AIRPORTS[q]) return AIRPORTS[q];
  // Extract code from "City (CODE)" format
  const match = query.match(/\(([A-Z]{3})\)/);
  if (match && AIRPORTS[match[1]]) return AIRPORTS[match[1]];
  // City name match
  const lower = query.toLowerCase();
  for (const [code, data] of Object.entries(AIRPORTS)) {
    if (data.city.toLowerCase().includes(lower) || lower.includes(data.city.toLowerCase())) {
      return data;
    }
  }
  // Partial code match
  for (const [code, data] of Object.entries(AIRPORTS)) {
    if (code.startsWith(q.substr(0, 3))) return data;
  }
  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { from, to, date, adults = 1, children = 0, cabinClass = 'economy' } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ error: 'from, to and date are required' });
  }

  const origin = resolveAirport(from);
  const dest = resolveAirport(to);

  if (!origin) return res.status(200).json({ itineraries: [], count: 0, message: 'Airport not found for: ' + from + '. Try using airport code like SEA, LHR, DXB' });
  if (!dest) return res.status(200).json({ itineraries: [], count: 0, message: 'Airport not found for: ' + to + '. Try using airport code like SEA, LHR, DXB' });

  try {
    const url = `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${origin.entityId}&toEntityId=${dest.entityId}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`;

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
      }
    });

    const data = await response.json();

    if (!data || data.status === false || !data.data) {
      // Return helpful error with raw response for debugging
      return res.status(200).json({
        itineraries: [],
        count: 0,
        message: 'No flights returned from API',
        apiStatus: data?.status,
        apiMessage: data?.message || 'Unknown error'
      });
    }

    const itineraries = (data.data.itineraries || []).slice(0, 12).map(it => {
      const leg = it.legs?.[0];
      const seg = leg?.segments?.[0];
      return {
        id: it.id,
        price: Math.round(it.price?.raw || 0),
        priceFormatted: it.price?.formatted || '$' + Math.round(it.price?.raw || 0),
        airline: leg?.carriers?.marketing?.[0]?.name || seg?.operatingCarrier?.name || 'Unknown Airline',
        airlineCode: leg?.carriers?.marketing?.[0]?.alternateId || '??',
        from: leg?.origin?.displayCode || origin.skyId,
        to: leg?.destination?.displayCode || dest.skyId,
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

    return res.status(200).json({
      itineraries,
      count: itineraries.length,
      origin: origin.city,
      destination: dest.city
    });

  } catch (err) {
    console.error('Flight search error:', err);
    return res.status(500).json({ error: err.message });
  }
};
