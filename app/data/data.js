export const Hazards = [
  {
    id: 1,
    name: "softStory",
    title: "Soft story",
    description:
      "Soft story buildings have less structural integrity in an earthquake",
    update: "00-00-0000",
    color: "#A0AEC0", // grey/400
  },
  {
    id: 2,
    name: "seismic",
    title: "Seismic",
    description:
      "This region is known to experience more focused seismic activity",
    update: "00-00-0000",
    color: "#F6AD55", // orange
  },
  {
    id: 3,
    name: "tsunami",
    title: "Tsunami",
    description:
      "These coastal areas can be at risk of flooding in the event of a tsunami",
    update: "00-00-0000",
    color: "#63B3ED", // tsunamiBlue
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
    role: "Product Designer",
    name: "UX Writer",
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
