export const glossary = [
  {
    term: "Air changes per hour (ACH)",
    definition:
      "Volumetric outdoor-air exchange divided by zone volume, expressed per hour. Internal circulation is not outdoor-air exchange. Natural infiltration varies with weather and openings; ACH measured at a blower-door test pressure is not natural operating ACH.",
  },
  {
    term: "Air-side opportunity",
    definition:
      "An outdoor or processed supply-air state that can move temperature or moisture in a useful direction. It does not establish sufficient airflow, installed capacity, indoor attainment, or cost.",
  },
  {
    term: "Coincident state",
    definition:
      "Weather variables belonging to the same timestamp or correctly aligned interval. Independent temperature and humidity percentiles usually do not describe an air state that actually occurred.",
  },
  {
    term: "Condensation",
    definition:
      "Conversion of water vapor to liquid at a surface at or below the relevant air dewpoint. It releases latent heat. Roof condensation is not automatically a safe, controlled substitute for dehumidification.",
  },
  {
    term: "Deadband",
    definition:
      "A separation between control thresholds that reduces conflicting commands or rapid switching. Hysteresis uses different entry and exit thresholds; equipment minimum run and rest times impose additional constraints.",
  },
  {
    term: "Dewpoint",
    definition:
      "The temperature at which cooling air at approximately constant pressure and water content reaches saturation. Below freezing, the water-versus-ice saturation convention must be stated; dewpoint and frost point are not interchangeable.",
  },
  {
    term: "Dewpoint margin",
    definition:
      "Relevant leaf or surface temperature minus air dewpoint. A room-air margin does not prove every leaf, frame, or glazing surface is condensation-free.",
  },
  {
    term: "DLI",
    definition:
      "Daily light integral: photosynthetic photon flux density integrated over time, expressed in mol of photons per square meter per day. Outdoor shortwave radiation is not canopy DLI without spectral, optical, geometric, and time assumptions.",
  },
  {
    term: "DOAS",
    definition:
      "Dedicated outdoor-air system: a system that conditions the required outdoor-air stream separately from zone recirculation. Its ability to remove crop moisture depends on supply humidity ratio and dry-air mass flow, not its name.",
  },
  {
    term: "Dry-bulb temperature",
    definition:
      "The ordinary air temperature measured with a suitable shielded sensor. It describes sensible thermal state but not the amount of water vapor present or leaf temperature.",
  },
  {
    term: "Enthalpy",
    definition:
      "A thermodynamic energy property. Moist-air specific enthalpy combines sensible and water-vapor contributions on a stated dry-air mass basis, commonly J/kg dry air. A lower enthalpy alone does not guarantee useful temperature and moisture directions separately.",
  },
  {
    term: "ERA5",
    definition:
      "An ECMWF global atmospheric reanalysis combining a physical weather model with observations. A gridded estimate is not a measurement at the greenhouse. This module uses an illustrative 2024 hourly ERA5 record through Open-Meteo.",
  },
  {
    term: "ERV",
    definition:
      "Energy-recovery ventilator that transfers sensible heat and some moisture between air streams. Moisture transfer may reduce incoming humidity loads or undermine a desired drying purge, depending on the direction of the moisture gradient.",
  },
  {
    term: "Evaporative effectiveness",
    definition:
      "In an idealized direct evaporative cooler, the actual dry-bulb reduction divided by the available outdoor dry-bulb minus wet-bulb difference. It is not a guarantee of greenhouse temperature or a constant product rating at every airflow.",
  },
  {
    term: "Free cooling",
    definition:
      "Using favorable outdoor conditions to reduce mechanical cooling demand. Fans, filtering, water treatment, heating compensation, CO₂ losses, and controls may still carry costs; free refers to the opportunity, not zero operating expense.",
  },
  {
    term: "HRV",
    definition:
      "Heat-recovery ventilator intended primarily to transfer sensible heat between exhaust and incoming air. Real devices require attention to leakage, condensation, frost protection, pressure balance, and actual operating performance.",
  },
  {
    term: "Humidity ratio",
    definition:
      "Mass of water vapor divided by mass of dry air, W, in kg/kg dry air, often displayed as g/kg. It is the appropriate moisture coordinate for dry-air-based mass balances and depends on pressure for a given temperature and RH.",
  },
  {
    term: "Latent load",
    definition:
      "The moisture-removal requirement expressed as an equivalent rate of energy transfer associated with phase change. Crop evaporation, outside-air moisture, and wet surfaces contribute; temperature control alone need not remove this water.",
  },
  {
    term: "Pressure: surface versus sea level",
    definition:
      "Surface or station pressure describes the actual air at the site. Mean-sea-level pressure has been adjusted for meteorological comparison and must not replace local absolute pressure in psychrometric calculations.",
  },
  {
    term: "Psychrometrics",
    definition:
      "The thermodynamic study of moist air and its processes. A known total pressure plus two independent, compatible moist-air properties usually defines the state needed for engineering calculations.",
  },
  {
    term: "Reheat",
    definition:
      "Heating air after cooling and moisture removal to reach a desired supply temperature. Recovered condenser heat may provide it, but recovered heat cannot also be counted as rejected outdoors at the same time.",
  },
  {
    term: "Relative humidity (RH)",
    definition:
      "Water-vapor partial pressure divided by saturation vapor pressure at the stated air temperature and saturation-phase convention. RH is not the percentage of a fixed water-holding container and cannot by itself compare moisture content between different temperatures.",
  },
  {
    term: "Sensible load",
    definition:
      "The rate of heat addition or removal associated with temperature change, distinct from the energy associated with water phase change. Sensible and latent processes are nevertheless coupled in real crop rooms and equipment.",
  },
  {
    term: "U-value",
    definition:
      "Overall heat-transfer coefficient in W/(m²·K). Multiply by actual assembly area and temperature difference to estimate steady conductive heat flow. A panel-only rating is not necessarily a whole-building value.",
  },
  {
    term: "Vapor pressure deficit (VPD)",
    definition:
      "Saturation vapor pressure at a chosen reference temperature minus actual air vapor pressure. Air VPD uses air temperature; leaf VPD uses leaf temperature. Neither alone fully predicts crop transpiration or disease risk.",
  },
  {
    term: "Wet-bulb temperature",
    definition:
      "A moist-air property related to evaporative cooling. Ideal direct evaporation approaches the inlet wet-bulb temperature, rather than cooling without limit; actual leaving state depends on effectiveness, pressure, and process assumptions.",
  },
];
