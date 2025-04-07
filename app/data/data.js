export const Hazards = [
  {
    id: 1,
    name: "softStory",
    title: "Structural safety",
    description:
      "Soft story buildings may need reinforcement to stay safe in an earthquake.",
    info: [
      "A soft story building is a structure built before 1978 that contains an open-floor level, such as a garage or retail space, below one or more living spaces.",
      "According to DataSF, there are 4,943 soft story buildings in SF. But not all are at risk!",
      "Some have been retrofitted to reinforce their lower levels and are generally considered earthquake-safe.",
      "Those that haven't made the required upgrades may face a greater risk of damage in an earthquake.",
    ],
    link: {
      label: "Soft story dataset",
      url: "https://data.sfgov.org/Housing-and-Buildings/Soft-Story-Properties/beah-shgi/about_data",
    },
  },
  {
    id: 2,
    name: "tsunami",
    title: "Tsunami zones",
    description:
      "Coastal areas can be at risk of flooding in the event of a tsunami.",
    info: [
      "Buildings in tsunami zones could experience flooding from waves generated by a large earthquake.",
      "Typically, buildings located inland from the coast are less at risk in the event of a tsunami.",
      "Building an emergency kit and planning an evacuation route can help coastal residents be prepared for a tsunami.",
    ],
    link: {
      label: "Tsunami dataset",
      url: "https://www.conservation.ca.gov/cgs/tsunami/maps",
    },
  },
  {
    id: 3,
    name: "liquefaction",
    title: "Liquefaction zones",
    description:
      "These areas are on less stable ground, which can result in shifting or sinking during an earthquake.",
    info: [
      "Liquefaction is a condition where soil turns into a liquid-like state under pressure.",
      "Buildings in liquefaction zones are at risk of sinking, tilting, or collapsing in a major earthquake.",
      "This risk can be lowered with seismic upgrades such as foundation reinforcement or drainage systems.",
    ],
    link: {
      label: "Liquefaction dataset",
      url: "https://data.sfgov.org/Geographic-Locations-and-Boundaries/Soil-Liquefaction-Hazard-Zone/i4t7-35u3/about_data",
    },
  },
];

export const Info = [
  {
    id: 1,
    name: "preparedness",
    title: "Preparedness",
    textStyle: "bold",
    list: [
      {
        id: 1,
        title: "Ready.gov",
        subtitle: "Earthquake guide",
        url: "https://www.ready.gov/",
      },
      {
        id: 2,
        title: "Earthquake Authority",
        url: "https://www.earthquakeauthority.com/",
      },
      {
        id: 3,
        title: "MyShake app",
        subtitle: "Early warning",
        url: "https://myshake.berkeley.edu/",
      },
    ],
  },
  {
    id: 2,
    name: "services",
    title: "Building retrofit services",
    list: [
      {
        id: 1,
        title: "Find a contractor",
        url: "https://www.californiaresidentialmitigationprogram.com/resources/find-a-contractor/",
      },
    ],
  },
  {
    id: 3,
    name: "grants",
    title: "Retrofit grants",
    list: [
      {
        id: 1,
        title: "Earthquake Brace + Bolt program",
        url: "https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ebb-retrofit",
      },
      {
        id: 2,
        title: "EarthquakeSoftStory.com",
        url: "https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ess-retrofit",
      },
    ],
  },
];

export const Headings = {
  home: {
    text: "Learn about your home’s earthquake readiness.",
    highlight: "Learn about",
    style: { paddingRight: "200", marginBottom: "30" },
    highlightStyle: { color: "yellow" },
  },
  about: {
    text: "Earthquake safety starts with knowledge. We're here to help.",
    highlight: "",
    style: { color: "blue", fontWeight: "300", paddingRight: "50" },
    highlightStyle: {},
    maxWidth: { base: "100%", md: "100%", xl: "842px" },
  },
};

export const mockAddressHazardData = [
  { exists: false, last_updated: null },
  { exists: true, last_updated: null },
  { exists: false, last_updated: null },
];

export const DataInfoLinks = [
  {
    id: 1,
    name: "softStory",
    label: "Soft Story Dataset",
    url: "https://data.sfgov.org/Housing-and-Buildings/Soft-Story-Properties/beah-shgi/about_data",
  },
  {
    id: 2,
    name: "liquefaction",
    label: "Liquefaction Dataset",
    url: "https://data.sfgov.org/Geographic-Locations-and-Boundaries/Soil-Liquefaction-Hazard-Zone/i4t7-35u3/about_data",
  },
  {
    id: 3,
    name: "tsunami",
    label: "Tsunami Dataset",
    url: "https://www.conservation.ca.gov/cgs/tsunami/maps",
  },
];

export const TeamMembers = [
  {
    id: 1,
    role: "Project Manager, Data Science",
    name: "Leela Solomon",
  },
  {
    id: 2,
    role: "Assistant Project Manager, Data Science",
    name: "Oscar Syu",
  },
  {
    id: 3,
    role: "Product Design Lead",
    name: "Micah Johnson",
  },
  {
    id: 12,
    role: "Engineering Lead",
    name: "Eli Lucherini ",
  },
  {
    id: 4,
    role: "Engineering Lead",
    name: "Anna Gennadinik",
  },
  {
    id: 5,
    role: "Engineering Lead",
    name: "Svetlana Eliseeva",
  },
  {
    id: 6,
    role: "Product Designer",
    name: "Jocelyn Su",
  },
  {
    id: 7,
    role: "UX Writer",
    name: "Nikki Collister",
  },
  {
    id: 8,
    role: "Front End Engineer",
    name: "Nick Visutsithiwong",
  },
  {
    id: 9,
    role: "Front End Engineer",
    name: "Amna Khan",
  },
  {
    id: 10,
    role: "Front End Engineer",
    name: "Diya Baliga",
  },
  {
    id: 14,
    role: "Full Stack Engineer",
    name: "Raymond Yee",
  },
  {
    id: 11,
    role: "Back End Engineer",
    name: "Adam Finkle",
  },
  {
    id: 13,
    role: "Data Science",
    name: "Peter Cuddihy",
  },
];
