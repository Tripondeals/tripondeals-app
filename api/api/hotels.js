const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { destination, checkin, checkout, adults = 2, rooms = 1 } = req.query;
  if (!destination || !checkin || !checkout) {
    return res.status(400).json({ error: 'destination, checkin and checkout required' });
  }

  try {
    // Search location ID first
    const locRes = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      }
    );
    const locData = await locRes.json();
    const dest = locData.data?.[0];
    if (!dest) return res.status(200).json({ hotels: [], message: 'Location not found' });

    const destId = dest.dest_id;
    const destType = dest.dest_type;

    const hotRes = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=${destId}&search_type=${destType}&arrival_date=${checkin}&departure_date=${checkout}&adults=${adults}&room_qty=${rooms}&units=metric&temperature_unit=c&languagecode=en-us&currency_code=USD`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      }
    );
    const hotData = await hotRes.json();
    const hotels = (hotData.data?.hotels || []).slice(0, 8).map(h => ({
      id: h.hotel_id,
      name: h.property?.name || 'Hotel',
      location: h.property?.wishlistName || destination,
      stars: Math.round(h.property?.propertyClass || 4),
      price: Math.round(h.property?.priceBreakdown?.grossPrice?.value || 0),
      currency: h.property?.priceBreakdown?.grossPrice?.currency || 'USD',
      rating: h.property?.reviewScore || 8.0,
      ratingLabel: h.property?.reviewScoreWord || 'Very Good',
      reviewCount: h.property?.reviewCount || 0,
      photo: h.property?.photoUrls?.[0] || '',
      checkin: h.property?.checkinDate || checkin,
      checkout: h.property?.checkoutDate || checkout
    }));

    return res.status(200).json({ hotels, count: hotels.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
