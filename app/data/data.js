export const Hazards = [
  {
    id: 1,
    name: "softStory",
    title: "Structural safety",
    description:
      "Soft story buildings may need reinforcement to stay safe in an earthquake.",
  },
  {
    id: 2,
    name: "tsunami",
    title: "Tsunami zones",
    description:
      "Coastal areas can be at risk of flooding in the event of a tsunami.",
  },
  {
    id: 3,
    name: "liquefaction",
    title: "Liquefaction zones",
    description:
      "These areas are on less stable ground, which can result in shifting or sinking during an earthquake.y",
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
    style: {},
    highlightStyle: { color: "yellow" },
    maxWidth: { base: "332px", md: "457px", xl: "546px" },
  },
  about: {
    text: "Our mission is to consectetur vestibulum purus nec tellus",
    highlight: "Our mission is to",
    style: { color: "blue", fontWeight: "700" },
    highlightStyle: { fontWeight: "400", color: "grey.900" },
    maxWidth: { base: "100%", md: "100%", xl: "842px" },
  },
};

export const mockAddressHazardData = [
  { exists: false, last_updated: null },
  { exists: true, last_updated: null },
  { exists: false, last_updated: null },
];
