const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

// Airport code lookup - city name to IATA code
const CITY_TO_IATA = {
  'seattle': 'SEA', 'london': 'LHR', 'dubai': 'DXB', 'paris': 'CDG',
  'new york': 'JFK', 'newyork': 'JFK', 'los angeles': 'LAX',
  'bali': 'DPS', 'denpasar': 'DPS', 'tokyo': 'NRT', 'singapore': 'SIN',
  'bangkok': 'BKK', 'sydney': 'SYD', 'melbourne': 'MEL',
  'amsterdam': 'AMS', 'frankfurt': 'FRA', 'madrid': 'MAD',
  'barcelona': 'BCN', 'rome': 'FCO', 'milan': 'MXP',
  'istanbul': 'IST', 'doha': 'DOH', 'abu dhabi': 'AUH',
  'mumbai': 'BOM', 'delhi': 'DEL', 'hong kong': 'HKG',
  'seoul': 'ICN', 'beijing': 'PEK', 'shanghai': 'PVG',
  'toronto': 'YYZ', 'vancouver': 'YVR', 'miami': 'MIA',
  'chicago': 'ORD', 'boston': 'BOS', 'san francisco': 'SFO',
  'las vegas': 'LAS', 'cairo': 'CAI', 'johannesburg': 'JNB',
  'nairobi': 'NBO', 'kuala lumpur': 'KUL', 'jakarta': 'CGK',
  'manila': 'MNL', 'karachi': 'KHI', 'lahore': 'LHE',
  'islamabad': 'ISB', 'riyadh': 'RUH', 'jeddah': 'JED',
  'athens': 'ATH', 'zurich': 'ZRH', 'vienna': 'VIE',
  'brussels': 'BRU', 'lisbon': 'LIS', 'copenhagen': 'CPH',
  'stockholm': 'ARN', 'oslo': 'OSL', 'helsinki': 'HEL',
  'dublin': 'DUB', 'manchester': 'MAN', 'birmingham': 'BHX',
};

function resolveCode(input) {
  if (!input) return null;
  const trimmed = input.trim();
  // Already a 3-letter IATA code
  if (/^[A-Z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  // Extract code from "City (CODE)" format
  const match = trimmed.match(/\(([A-Z]{3})\)/i);
  if (match) return match[1].toUpperCase();
  // Look up by city name
  const lower = trimmed.toLowerCase();
  if (CITY_TO_IATA[lower]) return CITY_TO_IATA[lower];
  // Partial match
  for (const [city, code] of Object.entries(CITY_TO_IATA)) {
    if (lower.includes(city) || city.includes(lower)) return code;
  }
  return trimmed.toUpperCase().slice(0, 3);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { from, to, date, adults = 1, children = 0, cabinClass = 'economy' } = req.query;
  if (!from || !to || !date) return res.status(400).json({ error: 'from, to and date required' });

  const fromCode = resolveCode(from);
  const toCode = resolveCode(to);

  try {
    // Use IATA codes directly - this is what works with this API
    const url = `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${fromCode}&toEntityId=${toCode}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`;

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
      }
    });

    const data = await response.json();

    if (!data?.data) {
      return res.status(200).json({ itineraries: [], count: 0, message: 'No data returned', status: data?.status, msg: data?.message });
    }

    const itineraries = (data.data.itineraries || []).slice(0, 12).map(it => {
      const leg = it.legs?.[0];
      return {
        id: it.id,
        price: Math.round(it.price?.raw || 0),
        priceFormatted: it.price?.formatted || '$' + Math.round(it.price?.raw || 0),
        airline: leg?.carriers?.marketing?.[0]?.name || 'Unknown Airline',
        airlineCode: leg?.carriers?.marketing?.[0]?.alternateId || '??',
        from: leg?.origin?.displayCode || fromCode,
        to: leg?.destination?.displayCode || toCode,
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

    // If session incomplete, still return whatever we got
    return res.status(200).json({
      itineraries,
      count: itineraries.length,
      sessionStatus: data.data?.context?.status,
      from: fromCode,
      to: toCode
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
