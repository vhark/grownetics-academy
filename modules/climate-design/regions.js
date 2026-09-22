// Illustrative study settings, not exact biome or Köppen classifications.
export const regions = [
  {
    id: "hot-dry",
    name: "Hot–dry",
    context:
      "Phoenix and Marrakech are northern-hemisphere inland examples. Their cool-season and summer moisture patterns are not interchangeable.",
    building:
      "How do external shading, glazing area and night-time envelope losses change the sensible load?",
    equipment:
      "When does a real wet-bulb depression support evaporative cooling, and what water quality, consumption and humidity penalties follow?",
    controls:
      "Use outdoor humidity ratio and wet-bulb limits, not an RH-only enable signal; protect against over-humidifying the crop.",
  },
  {
    id: "hot-humid",
    name: "Hot–humid",
    context:
      "Miami has stronger northern seasonal variation; near-equatorial Singapore has a much smaller annual temperature swing. Neither is represented by temperature alone.",
    building:
      "How will airtightness, vapor control and thermal bridges limit outdoor moisture entry and condensation?",
    equipment:
      "Can the cooling coil remove the crop and infiltration moisture at part load, and where does rejected heat go?",
    controls:
      "Coordinate dehumidification, cooling and reheat; opening vents can add moisture even when outside RH looks lower.",
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    context:
      "Almería and Cape Town illustrate opposite hemispheres: compare seasonal timing, not matching calendar months as though both were summer.",
    building:
      "How should seasonal shade and insulation balance summer solar gains against cool-season heat loss?",
    equipment:
      "What combination of ventilation, evaporative cooling and heating is worth evaluating against hourly sensible and latent loads?",
    controls:
      "Switch seasonal modes with measured outdoor state and crop needs; a warm-season strategy is not automatically useful in winter.",
  },
  {
    id: "cool-maritime",
    name: "Cool–maritime",
    context:
      "Westland and Seattle share maritime influence but differ in seasonal solar availability. A city point is not a surveyed greenhouse site.",
    building:
      "How do light transmission, heat retention and cold surface temperatures trade off in a glazed structure?",
    equipment:
      "Could heat recovery or heat-pump dehumidification reduce the heat lost through moisture-control ventilation?",
    controls:
      "Coordinate screens, heating and humidity removal so energy savings do not create cold-surface condensation.",
  },
  {
    id: "cold-winter",
    name: "Cold winters",
    context:
      "Montréal is continental; Fairbanks is subarctic. Latitude, winter light and the duration of cold are materially different, not one uniform climate.",
    building:
      "What thermal bridges, airtightness details and interior surface temperatures govern heat loss and condensation?",
    equipment:
      "How do low ambient temperature, frosting and defrost affect heat-pump and heat-recovery capacity?",
    controls:
      "Prioritize freeze protection and safe failure modes; coordinate moisture removal with heat recovery and equipment operating envelopes.",
  },
  {
    id: "tropical-highland",
    name: "Tropical highlands",
    context:
      "Nairobi and Bogotá are near the equator at elevation. Lower pressure changes humidity ratio and air mass per unit volume; weak annual temperature variation does not eliminate daily load swings.",
    building:
      "Does the structure manage daytime solar gain while retaining enough heat on cool nights?",
    equipment:
      "Have fans, coils and moisture balances been evaluated at site pressure rather than sea-level air density?",
    controls:
      "Use pressure-aware psychrometrics and day/night staging; check cloud-driven solar changes before treating mild air temperature as a small load.",
  },
  {
    id: "monsoonal",
    name: "Monsoonal",
    context:
      "Mumbai is coastal; Chiang Mai is inland. Seasonal humidity and cloud changes matter alongside temperature, and these two locations do not share identical monsoon timing.",
    building:
      "How do shade, rain protection and air leakage perform through both dry and wet seasons?",
    equipment:
      "Can moisture removal meet wet-season loads when evaporative cooling has little available depression?",
    controls:
      "Use outdoor moisture and equipment limits for seasonal mode changes; check pollutants, rain and biosecurity before enabling ventilation.",
  },
];

export const cities = [
  {
    id: "phoenix",
    name: "Phoenix",
    country: "United States",
    region: "hot-dry",
    latitude: 33.4484,
    longitude: -112.074,
    timezone: "America/Phoenix",
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    region: "hot-dry",
    latitude: 31.6295,
    longitude: -7.9811,
    timezone: "Africa/Casablanca",
  },
  {
    id: "miami",
    name: "Miami",
    country: "United States",
    region: "hot-humid",
    latitude: 25.7617,
    longitude: -80.1918,
    timezone: "America/New_York",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    region: "hot-humid",
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: "Asia/Singapore",
  },
  {
    id: "almeria",
    name: "Almería",
    country: "Spain",
    region: "mediterranean",
    latitude: 36.834,
    longitude: -2.4637,
    timezone: "Europe/Madrid",
  },
  {
    id: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    region: "mediterranean",
    latitude: -33.9249,
    longitude: 18.4241,
    timezone: "Africa/Johannesburg",
  },
  {
    id: "westland",
    name: "Westland",
    country: "Netherlands",
    region: "cool-maritime",
    latitude: 51.999,
    longitude: 4.2081,
    timezone: "Europe/Amsterdam",
  },
  {
    id: "seattle",
    name: "Seattle",
    country: "United States",
    region: "cool-maritime",
    latitude: 47.6062,
    longitude: -122.3321,
    timezone: "America/Los_Angeles",
  },
  {
    id: "montreal",
    name: "Montréal",
    country: "Canada",
    region: "cold-winter",
    latitude: 45.5019,
    longitude: -73.5674,
    timezone: "America/Toronto",
  },
  {
    id: "fairbanks",
    name: "Fairbanks",
    country: "United States",
    region: "cold-winter",
    latitude: 64.8378,
    longitude: -147.7164,
    timezone: "America/Anchorage",
  },
  {
    id: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    region: "tropical-highland",
    latitude: -1.2921,
    longitude: 36.8219,
    timezone: "Africa/Nairobi",
  },
  {
    id: "bogota",
    name: "Bogotá",
    country: "Colombia",
    region: "tropical-highland",
    latitude: 4.711,
    longitude: -74.0721,
    timezone: "America/Bogota",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    region: "monsoonal",
    latitude: 19.076,
    longitude: 72.8777,
    timezone: "Asia/Kolkata",
  },
  {
    id: "chiang-mai",
    name: "Chiang Mai",
    country: "Thailand",
    region: "monsoonal",
    latitude: 18.7883,
    longitude: 98.9853,
    timezone: "Asia/Bangkok",
  },
];
