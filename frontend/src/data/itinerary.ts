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

const northOfOrdinary = {
  name: "North of Ordinary",
  description: "Guest suite, private entrance, hot tub, peekaboo bay views",
  mapsUrl: "https://maps.apple.com/?q=1709+Alpine+Road%2C+Traverse+City%2C+MI+49686",
};

export const itinerary: ItineraryItem[] = [
  {
    id: "day-1",
    isoDate: "2026-09-05",
    day: "Day 1",
    date: "Sat, Sep 5",
    title: "Arrival",
    location: "Old Mission Peninsula",
    mapsUrl: "https://maps.apple.com/?q=13512+Peninsula+Dr%2C+Traverse+City%2C+MI+49686",
    lat: 44.83,
    lng: -85.51,
    description: "4 hr drive from Wixom, plus a stop.",
    hotelNote: "Check in 4:00 PM",
    hotel: northOfOrdinary,
    restaurants: [
      {
        name: "Jolly Pumpkin",
        time: "1:00 pm",
        note: "Walk-ins fine",
        phone: "(231) 223-4333",
        description: "Wood-fired pizza on a bay-view patio",
        mapsUrl: "https://maps.apple.com/?q=13512+Peninsula+Dr%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "The Boathouse",
        time: "6:30 pm",
        status: "waitlisted",
        note: "Notify alert via OpenTable",
        phone: "(231) 223-4030",
        description: "Upscale, right on West Bay",
        mapsUrl: "https://maps.apple.com/?q=14039+Peninsula+Dr%2C+Traverse+City%2C+MI+49686",
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
    mapsUrl: "https://maps.apple.com/?q=Old+Mission+Peninsula%2C+MI",
    lat: 44.9,
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
        mapsUrl: "https://maps.apple.com/?q=18250+Mission+Rd%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Old Mission Lighthouse Park",
        time: "10:15 am",
        note: "Trails, 45th parallel marker",
        phone: "(231) 645-0759",
        description: "Lighthouse, rocky shoreline",
        mapsUrl: "https://maps.apple.com/?q=20500+Center+Rd%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Haserot Beach Park",
        time: "11:30 am",
        note: "Quiet, mostly locals",
        description: "Sandy bay beach",
        mapsUrl: "https://maps.apple.com/?q=Haserot+Beach+Park%2C+Old+Mission+Peninsula%2C+MI",
      },
      {
        name: "Hawthorne Vineyards",
        time: "1:30 pm",
        note: "Walk-ins fine",
        phone: "(231) 929-4206",
        description: "Ridge overlooking both bays",
        mapsUrl: "https://maps.apple.com/?q=1000+Camino+Maria+Dr%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Bowers Harbor Vineyards",
        time: "2:30 pm",
        note: "Walk-ins fine",
        phone: "(231) 223-7615",
        description: "20 acres of vines, quieter",
        mapsUrl: "https://maps.apple.com/?q=2896+Bowers+Harbor+Rd%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Trattoria Stella",
        time: "7:15 pm",
        status: "confirmed",
        note: "Cancel by noon to avoid $25/guest fee",
        phone: "(231) 929-8989",
        description: "Farm-to-table Italian, Grand Traverse Commons",
        mapsUrl: "https://maps.apple.com/?q=830+Cottageview+Dr%2C+Traverse+City%2C+MI+49684",
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
    mapsUrl: northOfOrdinary.mapsUrl,
    lat: 44.83,
    lng: -85.51,
    description: "4 hr drive back — Labor Day traffic.",
    hotelNote: "Checkout 11:00 AM",
    hotel: northOfOrdinary,
    mealNote: "No reservations",
  },
];
