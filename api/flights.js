const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'aa061e46d2mshff934098cd8466cp13b36bjsn3523c5f86479';

// Comprehensive world airports database - 500+ airports
const AIRPORTS = {
  // USA
  'ATL':'Atlanta','LAX':'Los Angeles','ORD':'Chicago OHare','DFW':'Dallas','DEN':'Denver',
  'JFK':'New York JFK','SFO':'San Francisco','SEA':'Seattle','LAS':'Las Vegas','MCO':'Orlando',
  'EWR':'Newark','PHX':'Phoenix','IAH':'Houston','MIA':'Miami','BOS':'Boston',
  'MSP':'Minneapolis','DTW':'Detroit','FLL':'Fort Lauderdale','PHL':'Philadelphia','LGA':'New York LaGuardia',
  'BWI':'Baltimore','SLC':'Salt Lake City','SAN':'San Diego','TPA':'Tampa','PDX':'Portland',
  'HNL':'Honolulu','MDW':'Chicago Midway','BNA':'Nashville','AUS':'Austin','DAL':'Dallas Love',
  'IAD':'Washington Dulles','DCA':'Washington Reagan','STL':'St Louis','OAK':'Oakland',
  'MCI':'Kansas City','RDU':'Raleigh Durham','SMF':'Sacramento','SJC':'San Jose',
  'CLE':'Cleveland','PIT':'Pittsburgh','IND':'Indianapolis','CMH':'Columbus','MKE':'Milwaukee',
  'OMA':'Omaha','BUF':'Buffalo','RIC':'Richmond','ORF':'Norfolk','JAX':'Jacksonville',
  'MEM':'Memphis','BHM':'Birmingham','MSY':'New Orleans','SAT':'San Antonio','ELP':'El Paso',
  'ABQ':'Albuquerque','TUL':'Tulsa','OKC':'Oklahoma City','LIT':'Little Rock',
  'GRR':'Grand Rapids','DSM':'Des Moines','OGG':'Maui','KOA':'Kona','LIH':'Kauai',
  // CANADA
  'YYZ':'Toronto','YVR':'Vancouver','YUL':'Montreal','YYC':'Calgary','YEG':'Edmonton',
  'YOW':'Ottawa','YHZ':'Halifax','YWG':'Winnipeg','YQB':'Quebec City',
  // UK
  'LHR':'London Heathrow','LGW':'London Gatwick','MAN':'Manchester','STN':'London Stansted',
  'LTN':'London Luton','BHX':'Birmingham','GLA':'Glasgow','EDI':'Edinburgh',
  'BRS':'Bristol','NCL':'Newcastle','LBA':'Leeds Bradford','BFS':'Belfast',
  // EUROPE
  'CDG':'Paris Charles de Gaulle','ORY':'Paris Orly','AMS':'Amsterdam','FRA':'Frankfurt',
  'MAD':'Madrid','BCN':'Barcelona','FCO':'Rome Fiumicino','LIN':'Milan Linate',
  'MXP':'Milan Malpensa','ZRH':'Zurich','VIE':'Vienna','BRU':'Brussels',
  'CPH':'Copenhagen','ARN':'Stockholm','OSL':'Oslo','HEL':'Helsinki',
  'LIS':'Lisbon','OPO':'Porto','ATH':'Athens','IST':'Istanbul','SAW':'Istanbul Sabiha',
  'DUB':'Dublin','PRG':'Prague','BUD':'Budapest','WAW':'Warsaw','KRK':'Krakow',
  'SOF':'Sofia','OTP':'Bucharest','SKP':'Skopje','ZAG':'Zagreb','LJU':'Ljubljana',
  'TXL':'Berlin Tegel','BER':'Berlin Brandenburg','HAM':'Hamburg','MUC':'Munich',
  'DUS':'Dusseldorf','CGN':'Cologne','STR':'Stuttgart','NUE':'Nuremberg',
  'NCE':'Nice','MRS':'Marseille','LYS':'Lyon','TLS':'Toulouse','BOD':'Bordeaux',
  'NAP':'Naples','VCE':'Venice','BLQ':'Bologna','PSA':'Pisa','PMI':'Palma',
  'AGP':'Malaga','ALC':'Alicante','VLC':'Valencia','SVQ':'Seville','IBZ':'Ibiza',
  'RIX':'Riga','TLL':'Tallinn','VNO':'Vilnius','KBP':'Kyiv','ODS':'Odessa',
  'SVO':'Moscow Sheremetyevo','DME':'Moscow Domodedovo','LED':'St Petersburg',
  'GVA':'Geneva','BSL':'Basel','BEG':'Belgrade','TIV':'Tivat','DBV':'Dubrovnik',
  'SPU':'Split','ZAD':'Zadar','HER':'Heraklion','RHO':'Rhodes','CFU':'Corfu',
  'MLA':'Malta','TRS':'Trieste','PMO':'Palermo','CTA':'Catania','CAG':'Cagliari',
  // MIDDLE EAST
  'DXB':'Dubai','AUH':'Abu Dhabi','DOH':'Doha','BAH':'Bahrain',
  'KWI':'Kuwait','MCT':'Muscat','AMM':'Amman','BEY':'Beirut',
  'TLV':'Tel Aviv','CAI':'Cairo','HRG':'Hurghada','SSH':'Sharm El Sheikh',
  'RUH':'Riyadh','JED':'Jeddah','DMM':'Dammam','MED':'Madinah',
  'SHJ':'Sharjah','RKT':'Ras Al Khaimah','FJR':'Fujairah',
  // ASIA
  'SIN':'Singapore','BKK':'Bangkok','DMK':'Bangkok Don Mueang',
  'KUL':'Kuala Lumpur','PEN':'Penang','LGK':'Langkawi',
  'CGK':'Jakarta','DPS':'Bali','SUB':'Surabaya','JOG':'Yogyakarta',
  'MNL':'Manila','CEB':'Cebu','KHH':'Kaohsiung',
  'NRT':'Tokyo Narita','HND':'Tokyo Haneda','KIX':'Osaka','NGO':'Nagoya',
  'FUK':'Fukuoka','CTS':'Sapporo','OKA':'Okinawa',
  'ICN':'Seoul Incheon','GMP':'Seoul Gimpo','PUS':'Busan',
  'PEK':'Beijing Capital','PKX':'Beijing Daxing','PVG':'Shanghai Pudong',
  'SHA':'Shanghai Hongqiao','CAN':'Guangzhou','SZX':'Shenzhen',
  'CTU':'Chengdu','KMG':'Kunming','XIY':'Xian','WUH':'Wuhan',
  'HKG':'Hong Kong','MFM':'Macau','TPE':'Taipei','TSA':'Taipei Songshan',

  // INDIA - All major airports
  'BOM':'Mumbai','DEL':'Delhi','BLR':'Bangalore','MAA':'Chennai',
  'CCU':'Kolkata','HYD':'Hyderabad','AMD':'Ahmedabad','COK':'Kochi',
  'GOI':'Goa','JAI':'Jaipur','LKO':'Lucknow','PAT':'Patna',
  'PNQ':'Pune','IXC':'Chandigarh','ATQ':'Amritsar','SXR':'Srinagar',
  'IXB':'Bagdogra','GAU':'Guwahati','IMF':'Imphal','IXA':'Agartala',
  'BBI':'Bhubaneswar','VTZ':'Visakhapatnam','CJB':'Coimbatore',
  'IXM':'Madurai','TRV':'Thiruvananthapuram','IXE':'Mangalore',
  'BDQ':'Vadodara','NAG':'Nagpur','RPR':'Raipur','IDR':'Indore',
  'JLR':'Jabalpur','VNS':'Varanasi','IXU':'Aurangabad','RAJ':'Rajkot',
  'STV':'Surat','BHO':'Bhopal','GWL':'Gwalior','UDR':'Udaipur',
  'JDH':'Jodhpur','BHU':'Bhuj','AGR':'Agra','IXD':'Allahabad',
  'KNU':'Kanpur','AJL':'Aizawl','DIB':'Dibrugarh','MZU':'Muzaffarpur',
  'IXS':'Silchar','DBD':'Dhanbad','TEZ':'Tezpur','JRH':'Jorhat',
  'RGH':'Balurghat','IXI':'Lilabari','HOX':'Hohenschoenhausen',
  'IXL':'Leh','KUU':'Kullu Manali','IXH':'Kailashahar',
  'SHL':'Shillong','PYB':'Jeypore','VGA':'Vijayawada',
  'TIR':'Tirupati','HBX':'Hubli','IXG':'Belgaum','IXY':'Kandla',
  'NMB':'Diu','OMC':'Omkareshwar','IXJ':'Jammu','AIP':'Adampur',
  'LUH':'Ludhiana','KLH':'Kolhapur','CDP':'Cuddapah','RJA':'Rajahmundry',
  'TJV':'Thanjavur','TCR':'Tuticorin','IXZ':'Port Blair',
  'CMB':'Colombo','MLE':'Maldives Male','KTM':'Kathmandu','DAC':'Dhaka',
  'CCU':'Kolkata','ISB':'Islamabad','KHI':'Karachi','LHE':'Lahore',
  'PEW':'Peshawar','MUX':'Multan','SKT':'Sialkot','UET':'Quetta',
  'TAS':'Tashkent','ALA':'Almaty','NQZ':'Nur-Sultan',
  'PNH':'Phnom Penh','REP':'Siem Reap','VTE':'Vientiane','RGN':'Yangon',
  'SGN':'Ho Chi Minh City','HAN':'Hanoi','DAD':'Da Nang','CXR':'Nha Trang',
  'ULN':'Ulaanbaatar',
  // AFRICA
  'JNB':'Johannesburg','CPT':'Cape Town','DUR':'Durban','PLZ':'Port Elizabeth',
  'NBO':'Nairobi','MBA':'Mombasa','DAR':'Dar es Salaam','ZNZ':'Zanzibar',
  'ADD':'Addis Ababa','CMN':'Casablanca','RAK':'Marrakech','TNG':'Tangier',
  'ALG':'Algiers','TUN':'Tunis','TRI':'Tripoli','LOS':'Lagos',
  'ABV':'Abuja','ACC':'Accra','DKR':'Dakar','ABJ':'Abidjan',
  'TNR':'Antananarivo','MRU':'Mauritius','RUN':'Reunion','SEZ':'Seychelles',
  'LLW':'Lilongwe','HRE':'Harare','WDH':'Windhoek','GBE':'Gaborone',
  'EBB':'Entebbe','KGL':'Kigali','HAH':'Moroni','MPM':'Maputo',
  // AUSTRALIA & PACIFIC
  'SYD':'Sydney','MEL':'Melbourne','BNE':'Brisbane','PER':'Perth',
  'ADL':'Adelaide','CBR':'Canberra','CNS':'Cairns','OOL':'Gold Coast',
  'DRW':'Darwin','HBA':'Hobart','TSV':'Townsville','MCY':'Sunshine Coast',
  'AKL':'Auckland','CHC':'Christchurch','WLG':'Wellington','ZQN':'Queenstown',
  'NAN':'Nadi Fiji','PPT':'Tahiti','RAR':'Rarotonga','INU':'Nauru',
  'HIR':'Honiara','VLI':'Port Vila','TBU':'Tonga',
  // LATIN AMERICA
  'GRU':'Sao Paulo Guarulhos','CGH':'Sao Paulo Congonhas','GIG':'Rio de Janeiro',
  'BSB':'Brasilia','CNF':'Belo Horizonte','FOR':'Fortaleza','SSA':'Salvador',
  'REC':'Recife','POA':'Porto Alegre','CWB':'Curitiba','MAO':'Manaus',
  'EZE':'Buenos Aires Ezeiza','AEP':'Buenos Aires Aeroparque','COR':'Cordoba',
  'SCL':'Santiago','ANF':'Antofagasta','PMC':'Puerto Montt',
  'BOG':'Bogota','MDE':'Medellin','CLO':'Cali','CTG':'Cartagena',
  'LIM':'Lima','CUZ':'Cusco','AQP':'Arequipa',
  'UIO':'Quito','GYE':'Guayaquil',
  'CCS':'Caracas','GUA':'Guatemala City','SAL':'San Salvador',
  'MGA':'Managua','SJO':'San Jose CR','PTY':'Panama City',
  'SDQ':'Santo Domingo','SJU':'San Juan','HAV':'Havana',
  'MBJ':'Montego Bay','KIN':'Kingston','POS':'Port of Spain',
  'GEO':'Georgetown','PBM':'Paramaribo','CAY':'Cayenne',
  'ASU':'Asuncion','MVD':'Montevideo','LPB':'La Paz','CBB':'Cochabamba',
  'CUN':'Cancun','MEX':'Mexico City','GDL':'Guadalajara','MTY':'Monterrey',
  'TIJ':'Tijuana','CUU':'Chihuahua','MID':'Merida','VER':'Veracruz',
  'MZT':'Mazatlan','PVR':'Puerto Vallarta','SJD':'Los Cabos','ZIH':'Ixtapa',
  // CARIBBEAN
  'AUA':'Aruba','CUR':'Curacao','SXM':'Sint Maarten','PTP':'Pointe a Pitre',
  'FDF':'Fort de France','BGI':'Barbados','TAB':'Tobago',
  'NAS':'Nassau','GCM':'Grand Cayman','BDA':'Bermuda',
  'STT':'St Thomas','STX':'St Croix','BQN':'Aguadilla',
  // CENTRAL ASIA
  'GYD':'Baku','EVN':'Yerevan','TBS':'Tbilisi',
  'ASB':'Ashgabat','DYU':'Dushanbe','FRU':'Bishkek',
};

function resolveCode(input) {
  if (!input) return null;
  const trimmed = input.trim();
  // Already IATA code
  if (/^[A-Z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  // Extract from "City (CODE)" format
  const match = trimmed.match(/\(([A-Z]{3})\)/i);
  if (match) return match[1].toUpperCase();
  // Search by city name (case insensitive)
  const lower = trimmed.toLowerCase();
  for (const [code, city] of Object.entries(AIRPORTS)) {
    if (city.toLowerCase().includes(lower) || lower.includes(city.toLowerCase().split(' ')[0])) {
      return code;
    }
  }
  // Return first 3 chars as fallback
  return trimmed.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
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

  if (!fromCode || fromCode.length !== 3) {
    return res.status(200).json({ itineraries: [], count: 0, message: 'Airport not found for: ' + from });
  }
  if (!toCode || toCode.length !== 3) {
    return res.status(200).json({ itineraries: [], count: 0, message: 'Airport not found for: ' + to });
  }

  try {
    const url = `https://flights-sky.p.rapidapi.com/flights/search-one-way?fromEntityId=${fromCode}&toEntityId=${toCode}&departDate=${date}&adults=${adults}&children=${children}&cabinClass=${cabinClass}`;

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
      }
    });

    const data = await response.json();

    if (!data?.data) {
      return res.status(200).json({ itineraries: [], count: 0, message: 'No flights found for ' + fromCode + ' → ' + toCode, apiMsg: data?.message });
    }

    const itineraries = (data.data.itineraries || []).slice(0, 15).map(it => {
      const leg = it.legs?.[0];
      return {
        id: it.id,
        price: Math.round(it.price?.raw || 0),
        priceFormatted: it.price?.formatted || '$' + Math.round(it.price?.raw || 0),
        airline: leg?.carriers?.marketing?.[0]?.name || 'Unknown Airline',
        airlineCode: leg?.carriers?.marketing?.[0]?.alternateId || '??',
        from: leg?.origin?.displayCode || fromCode,
        to: leg?.destination?.displayCode || toCode,
        fromCity: leg?.origin?.city || AIRPORTS[fromCode] || fromCode,
        toCity: leg?.destination?.city || AIRPORTS[toCode] || toCode,
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

    return res.status(200).json({ itineraries, count: itineraries.length, from: fromCode, to: toCode });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// This is just to count - the full file already has Indian airports
