export type Restaurant = {
  name: string;
  time: string;
  status?: "confirmed" | "waitlisted";
  note?: string;
  phone?: string;
  description?: string;
  mapsUrl?: string;
  clothing?: string;
};

export type ItineraryItem = {
  id: string;
  isoDate: string;
  day: string;
  date: string;
  title: string;
  location: string;
  locationBlurb?: string;
  mapsUrl: string;
  lat?: number;
  lng?: number;
  description?: string;
  clothing?: string;
  mealNote?: string;
  hotelNote?: string;
  hotel?: { name: string; phone?: string; description?: string; mapsUrl?: string };
  restaurants?: Restaurant[];
};

/** Apple Maps search link for an address/place query (already URL-encoded). */
const maps = (q: string) => `https://maps.apple.com/?q=${q}`;

const northOfOrdinary = {
  name: "North of Ordinary",
  description: "Guest suite, private entrance, hot tub, peekaboo bay views",
  mapsUrl: maps("1709+Alpine+Road%2C+Traverse+City%2C+MI+49686"),
};

export const itinerary: ItineraryItem[] = [
  {
    id: "day-1",
    isoDate: "2026-09-05",
    day: "Day 1",
    date: "Sat, Sep 5",
    title: "Arrival",
    location: "Old Mission Peninsula",
    locationBlurb: "West Grand Traverse Bay",
    mapsUrl: maps("Old+Mission+Peninsula%2C+MI"),
    lat: 44.83,
    lng: -85.51,
    description: "4 hr drive from Wixom, plus a stop.",
    clothing: "Comfortable clothes for the drive, a light layer for the bay-side patio.",
    hotelNote: "Check in 4:00 PM",
    hotel: northOfOrdinary,
    restaurants: [
      {
        name: "Jolly Pumpkin",
        time: "1:00 pm",
        note: "Walk-ins fine",
        phone: "(231) 223-4333",
        description: "Wood-fired pizza on a bay-view patio",
        mapsUrl: maps("13512+Peninsula+Dr%2C+Traverse+City%2C+MI+49686"),
      },
      {
        name: "The Boathouse",
        time: "6:30 pm",
        status: "waitlisted",
        note: "Notify alert via OpenTable",
        phone: "(231) 223-4030",
        description: "Upscale, right on West Bay",
        mapsUrl: maps("14039+Peninsula+Dr%2C+Traverse+City%2C+MI+49686"),
      },
    ],
  },
  {
    id: "day-2",
    isoDate: "2026-09-06",
    day: "Day 2",
    date: "Sun, Sep 6",
    title: "Peninsula day",
    location: "Old Mission Peninsula",
    locationBlurb: "Lighthouse, beach & wine trail",
    mapsUrl: maps("Old+Mission+Peninsula%2C+MI"),
    lat: 44.99,
    lng: -85.48,
    description: "Tip of the peninsula, ~25 min drive.",
    clothing: "Light layers — cool mornings, mild afternoons.",
    restaurants: [
      {
        name: "Old Mission General Store",
        time: "9:30 am",
        note: "Coffee & pastry",
        phone: "(231) 223-4310",
        description: "160-yr-old country store",
        mapsUrl: maps("18250+Mission+Rd%2C+Traverse+City%2C+MI+49686"),
      },
      {
        name: "Old Mission Lighthouse Park",
        time: "10:15 am",
        note: "Trails, 45th parallel marker",
        phone: "(231) 645-0759",
        description: "Lighthouse, rocky shoreline",
        mapsUrl: maps("20500+Center+Rd%2C+Traverse+City%2C+MI+49686"),
      },
      {
        name: "Haserot Beach Park",
        time: "11:30 am",
        note: "Quiet, mostly locals",
        description: "Sandy bay beach",
        mapsUrl: maps("Haserot+Beach+Park%2C+Old+Mission+Peninsula%2C+MI"),
      },
      {
        name: "Hawthorne Vineyards",
        time: "1:30 pm",
        note: "Walk-ins fine",
        phone: "(231) 929-4206",
        description: "Ridge overlooking both bays",
        mapsUrl: maps("1000+Camino+Maria+Dr%2C+Traverse+City%2C+MI+49686"),
      },
      {
        name: "Bowers Harbor Vineyards",
        time: "2:30 pm",
        note: "Walk-ins fine",
        phone: "(231) 223-7615",
        description: "20 acres of vines, quieter",
        mapsUrl: maps("2896+Bowers+Harbor+Rd%2C+Traverse+City%2C+MI+49686"),
      },
      {
        name: "Trattoria Stella",
        time: "7:15 pm",
        status: "confirmed",
        note: "Cancel by noon to avoid $25/guest fee",
        phone: "(231) 929-8989",
        description: "Farm-to-table Italian, Grand Traverse Commons",
        mapsUrl: maps("830+Cottageview+Dr%2C+Traverse+City%2C+MI+49684"),
      },
    ],
  },
  {
    id: "day-3",
    isoDate: "2026-09-07",
    day: "Day 3",
    date: "Mon, Sep 7",
    title: "Depart",
    location: "North of Ordinary",
    locationBlurb: "Checkout & drive home",
    mapsUrl: northOfOrdinary.mapsUrl,
    lat: 44.83,
    lng: -85.51,
    description: "4 hr drive back — Labor Day traffic.",
    hotelNote: "Checkout 11:00 AM",
    hotel: northOfOrdinary,
    mealNote: "No reservations",
  },
];
