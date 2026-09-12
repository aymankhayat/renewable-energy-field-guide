import type { EnergySource } from './types';

export const biomass: EnergySource = {
  key: 'biomass',
  label: 'Biomass',
  kind: 'Primary source · organic matter',
  color: '#8FBF6B',
  summary: 'Plants and waste store sunlight as chemical energy, released as heat or gas.',
  whatItIs:
    'Organic matter — crops, wood residue, agricultural or household waste — stores solar energy as chemical energy in its structure. Burning it, or breaking it down without oxygen (anaerobic digestion), releases that energy as usable heat, electricity, or gas.',
  howWeHarvest:
    'Direct combustion burns biomass to raise steam for a turbine, much like a coal plant. Gasification converts it into a combustible gas first. Anaerobic digesters let bacteria break down waste into biogas — mostly methane — which can be burned for power or upgraded into the gas grid.',
  bestEnvironments:
    "Anywhere with a reliable feedstock stream: agricultural regions with crop residue, forestry regions with wood waste, or dense cities generating municipal waste. Unlike the others, biomass isn't tied to a specific climate or geology.",
  capacityFactor: { min: 50, max: 80, text: '50–80% (dispatchable)' },
  cost: '$50–150 / MWh, feedstock-dependent',
  land: { text: 'High for dedicated energy crops, low for waste streams' },
  metrics: [
    { label: 'Dry wood energy content', quantity: { kind: 'fuelEnergy', min: 15, max: 19 } },
    { label: 'Crop residue energy content', quantity: { kind: 'fuelEnergy', min: 13, max: 17 }, note: 'Straw, husks, bagasse' },
    { label: 'Boiler steam temperature', quantity: { kind: 'temperature', min: 450, max: 540 } },
  ],
  countries: {
    76: 3, 752: 3, 246: 3, 356: 3, 764: 3, 40: 3,
    276: 2, 124: 2, 840: 2, 156: 2, 360: 2, 458: 2, 704: 2, 616: 2, 208: 2, 826: 2, 250: 2, 32: 2, 600: 2,
    710: 1, 404: 1, 566: 1, 231: 1, 800: 1, 180: 1, 36: 1, 554: 1, 784: 1, 682: 1, 634: 1, 484: 1, 170: 1,
  },
  hotspots: [
    { name: 'Drax, UK', coords: [-0.99, 53.74], detail: 'A former coal plant converted to burn wood pellets.' },
    { name: 'São Paulo cane belt, Brazil', coords: [-48.5, -21.5], detail: 'Sugar mills power themselves and the grid with bagasse.' },
    { name: 'Iowa, USA', coords: [-93.5, 42.0], detail: 'The heart of US corn ethanol.' },
    { name: 'Warsan, Dubai', coords: [55.42, 25.18], detail: 'One of the largest waste-to-energy plants in the world.' },
    { name: 'Uttar Pradesh, India', coords: [80.9, 27.0], detail: 'Sugarcane bagasse cogeneration at scale.' },
    { name: 'Central Sweden', coords: [15.5, 60.5], detail: 'Forestry residue fuels district heating.' },
    { name: 'Central Thailand', coords: [101.0, 15.0], detail: 'Rice husk and cane residue power plants.' },
  ],
  fit: {
    mena: { score: 3, note: 'Limited by feedstock, but waste-to-energy from municipal and agricultural waste is an active, growing strategy in Gulf cities.' },
    europe: { score: 4, note: 'Wood pellets, biogas, and waste-to-energy are widely deployed.' },
    namerica: { score: 3, note: 'Forestry residue, landfill gas, and corn ethanol.' },
    latam: { score: 4, note: 'Brazil burns sugarcane bagasse at scale and runs cars on ethanol.' },
    ssafrica: { score: 3, note: 'Traditional wood fuel dominates; modern biogas is growing.' },
    sasia: { score: 4, note: 'India uses rice husk and bagasse, and village biogas is common.' },
    easia: { score: 3, note: 'Palm and rice residues are plentiful, but plantations raise deforestation concerns.' },
    oceania: { score: 2, note: 'A small sector, mainly sugar-mill bagasse in Queensland.' },
  },
};

export const hydrogen: EnergySource = {
  key: 'hydrogen',
  label: 'Green hydrogen',
  kind: 'Energy carrier · made from water',
  color: '#B79CFF',
  summary: 'Renewable electricity splits water, and the hydrogen carries that energy elsewhere.',
  whatItIs:
    'Hydrogen isn’t a source of energy on its own. It’s a carrier. “Green” hydrogen is made by splitting water (H₂O) into hydrogen and oxygen in an electrolyzer powered by renewable electricity. The energy is stored in the hydrogen’s chemical bonds; running it through a fuel cell or burning it gives that energy back, with water as the only byproduct.',
  howWeHarvest:
    'Electrolyzers (alkaline, PEM, or solid-oxide) are built next to cheap solar and wind. The hydrogen is compressed into tanks, liquefied, or converted into ammonia to ship overseas. Its best uses are the ones electricity can’t easily reach: steelmaking, fertilizer, refining, and shipping fuel. Turning electricity into hydrogen and back only returns about 30–40% of the energy, so it’s rarely used just to store power.',
  bestEnvironments:
    'Places with very cheap, abundant renewable power, access to water (or seawater desalination), and ports for export: the Arabian Peninsula, North Africa, Australia, Chile, and Namibia.',
  capacityFactor: { min: 40, max: 70, text: '40–70%, set by the solar and wind supplying it' },
  cost: '$3–7 per kg H₂ (≈ $90–210 / MWh)',
  land: { text: 'Electrolyzers are compact; the footprint is the solar or wind farm feeding them' },
  metrics: [
    { label: 'Energy stored per unit mass', quantity: { kind: 'massEnergy', min: 33.3 }, note: 'About three times more than petrol by weight' },
    { label: 'Electricity to make it', quantity: { kind: 'massEnergy', min: 50, max: 55 } },
    { label: 'Tank storage pressure', quantity: { kind: 'pressure', min: 350, max: 700 } },
    { label: 'Liquefaction temperature', quantity: { kind: 'temperature', min: -253 } },
    { label: 'Water consumed', quantity: { kind: 'waterPerMass', min: 9, max: 30 }, note: '9 is the chemistry; the rest is purification and cooling' },
  ],
  countries: {
    682: 3, 512: 3, 36: 3, 152: 3, 516: 3, 504: 3, 478: 3,
    784: 2, 818: 2, 12: 2, 710: 2, 32: 2, 124: 2, 840: 2, 578: 2, 208: 2, 724: 2, 620: 2, 356: 2, 156: 2, 634: 2,
    826: 1, 528: 1, 76: 1, 484: 1, 400: 1, 788: 1, 398: 1, 496: 1,
  },
  hotspots: [
    { name: 'NEOM, Saudi Arabia', coords: [35.3, 27.9], detail: 'A multi-gigawatt solar and wind powered plant exporting green ammonia.' },
    { name: 'Duqm, Oman', coords: [57.7, 19.67], detail: 'A port-side hydrogen hub on the Arabian Sea.' },
    { name: 'Pilbara, Australia', coords: [118.0, -21.0], detail: 'Sun, wind, and iron-ore ports in one place.' },
    { name: 'Atacama, Chile', coords: [-69.9, -24.0], detail: 'Cheap solar close to the mining industry.' },
    { name: 'Magallanes, Chile', coords: [-71.0, -52.5], detail: 'Patagonian wind for e-fuels.' },
    { name: 'Tsau ǁKhaeb, Namibia', coords: [15.5, -27.0], detail: 'A desert coast export hub in the planning stage.' },
    { name: 'Kutch, India', coords: [70.0, 23.5], detail: 'A giant solar and wind park planned alongside hydrogen production.' },
  ],
  fit: {
    mena: { score: 5, note: "Cheap solar, deep-water ports, and export ambitions. Saudi Arabia's NEOM plant is among the largest under construction, and Oman is building hubs at Duqm and Salalah." },
    europe: { score: 3, note: 'Big demand for steel and chemicals. Europe will mostly import, topped up by North Sea wind.' },
    namerica: { score: 3, note: 'Strong wind and sun in Texas and the plains; policy support has been uneven.' },
    latam: { score: 4, note: "Chile's sun and Patagonian wind could make some of the cheapest hydrogen anywhere." },
    ssafrica: { score: 3, note: 'Namibia and South Africa plan export hubs, but water and financing are hurdles.' },
    sasia: { score: 3, note: 'India targets 5 million tonnes a year by 2030 for refining and fertilizer.' },
    easia: { score: 3, note: 'Japan and Korea are big future importers; China leads electrolyzer manufacturing.' },
    oceania: { score: 4, note: 'Australia pairs vast solar and wind with shipping routes to Asia.' },
  },
};

export const tidal: EnergySource = {
  key: 'tidal',
  label: 'Tidal & wave',
  kind: 'Primary source · the ocean',
  color: '#6F86FF',
  summary: "The Moon's pull moves whole seas on a timetable, and wind-driven waves carry energy to the coast.",
  whatItIs:
    "Tides are driven by the gravitational pull of the Moon and Sun, raising and lowering the sea twice a day on a schedule you can predict years ahead. Waves are wind energy that has been handed to the ocean's surface and carried across entire ocean basins. Tides are predictable; waves are variable but pack a lot of energy into a small area.",
  howWeHarvest:
    'Tidal barrages dam an estuary, trap water at high tide, and release it through turbines. Tidal stream turbines work like underwater wind turbines, anchored in fast channels where currents squeeze between islands or headlands. Wave energy converters — floating buoys, oscillating water columns, hinged snakes — turn the rise and fall of swells into motion. Most wave devices are still in the testing stage.',
  bestEnvironments:
    'For tides: coasts with a large tidal range and narrow channels that speed the flow, like the Bay of Fundy, Brittany, northern Scotland, and Korea’s west coast. For waves: west-facing coasts between 40° and 60° latitude that catch storms from open ocean, like Scotland, Ireland, Portugal, Chile, southern Australia, and New Zealand.',
  capacityFactor: { min: 20, max: 40, text: '25–40% tidal stream, 20–35% wave' },
  cost: '$150–300+ / MWh (early stage)',
  land: { text: 'Almost none on land; the footprint is on the seabed and coast' },
  metrics: [
    { label: 'Useful tidal range', quantity: { kind: 'length', min: 5, max: 16 }, note: 'The Bay of Fundy reaches about 16 m' },
    { label: 'Tidal stream speed', quantity: { kind: 'speed', min: 2, max: 5 }, note: 'Water is 800× denser than air' },
    { label: 'Wave energy per metre of coast', quantity: { kind: 'waveFlux', min: 20, max: 70 } },
  ],
  countries: {
    826: 3, 250: 3, 124: 3, 410: 3, 372: 3, 554: 3, 36: 3,
    620: 2, 152: 2, 32: 2, 840: 2, 578: 2, 352: 2, 710: 2,
    356: 1, 76: 1, 156: 1, 392: 1, 724: 1, 208: 1, 528: 1, 643: 1,
  },
  hotspots: [
    { name: 'MeyGen, Pentland Firth', coords: [-3.13, 58.66], detail: 'The largest tidal stream array in the world.' },
    { name: 'La Rance, France', coords: [-2.02, 48.62], detail: 'The first tidal barrage, running since 1966.' },
    { name: 'Sihwa Lake, South Korea', coords: [126.61, 37.31], detail: 'The largest tidal power station in operation.' },
    { name: 'Bay of Fundy, Canada', coords: [-64.5, 45.3], detail: 'The highest tides on Earth.' },
    { name: 'Kimberley, Australia', coords: [123.5, -16.4], detail: 'Tides of 10 m or more in remote gulfs.' },
    { name: 'Mutriku, Spain', coords: [-2.38, 43.31], detail: 'A wave plant built into a harbour breakwater.' },
    { name: 'Aguçadoura, Portugal', coords: [-8.78, 41.44], detail: 'The site of the first commercial wave farm.' },
    { name: 'Cook Inlet, Alaska', coords: [-151.0, 60.9], detail: 'Huge tidal currents close to Anchorage.' },
  ],
  fit: {
    mena: { score: 1, note: 'The Gulf has a small tidal range and sheltered seas, so there is little tidal or wave energy to capture.' },
    europe: { score: 5, note: "Scotland's MeyGen, France's La Rance, and the Atlantic wave test sites lead the world." },
    namerica: { score: 4, note: 'The Bay of Fundy has the highest tides on Earth; the Pacific Northwest has strong waves.' },
    latam: { score: 3, note: "Patagonian tides and Chile's powerful Pacific swell are largely untapped." },
    ssafrica: { score: 2, note: "South Africa's southwest coast gets strong waves, with little development so far." },
    sasia: { score: 2, note: "India's Gulf of Khambhat has been studied for tidal power, but projects have stalled." },
    easia: { score: 4, note: "South Korea's Sihwa Lake is the largest tidal plant in operation." },
    oceania: { score: 4, note: 'Southern Australia and New Zealand face some of the most energetic waves on Earth.' },
  },
};
