export const Hazards = [
  {
    id: 1,
    name: "softStory",
    title: "Soft story",
    description:
      "Soft story buildings have less structural integrity in an earthquake",
    update: "00-00-0000",
    color: "#171923",
  },
  {
    id: 2,
    name: "seismic",
    title: "Seismic",
    description:
      "This region is known to experience more focused seismic activity",
    update: "00-00-0000",
    color: "#F6AD55",
  },
  {
    id: 3,
    name: "tsunami",
    title: "Tsunami",
    description:
      "These coastal areas can be at risk of flooding in the event of a tsunami",
    update: "00-00-0000",
    color: "#ED64A6",
  },
];

export const Info = [
  {
    id: 1,
    name: "preparedness",
    title: "Preparedness",
    list: [
      {
        id: 1,
        title: "Ready.gov",
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
    style: { color: "blue", fontSize: "55px", fontWeight: "700" },
    highlightStyle: { fontWeight: "400", color: "grey.900" },
    maxWidth: { base: "100%", md: "100%", xl: "817px" },
  },
};
