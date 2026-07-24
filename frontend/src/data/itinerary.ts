export type Restaurant = {
  name: string;
  time: string;
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
  description: "Entire guest suite, private entrance, hot tub, peekaboo West Bay views",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=1709+Alpine+Road%2C+Traverse+City%2C+MI+49686",
};

export const itinerary: ItineraryItem[] = [
  {
    id: "day-1",
    isoDate: "2026-09-05",
    day: "Day 1",
    date: "Sat, Sep 5",
    title: "Arrival — Jolly Pumpkin, check in, dinner at The Boathouse",
    location: "Old Mission Peninsula",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=13512+Peninsula+Dr%2C+Traverse+City%2C+MI+49686",
    lat: 44.83,
    lng: -85.51,
    description: "Leave Wixom ~8:00 AM (4 hr drive + a stop). Arrive in Traverse City ~12:30–1:00 PM.",
    hotelNote: "Check-in: North of Ordinary, 4:00 PM",
    hotel: northOfOrdinary,
    restaurants: [
      {
        name: "Jolly Pumpkin (Old Mission Peninsula)",
        time: "1:00 pm",
        note: "lunch, walk-ins fine — Mon–Sat 12–9, Sun 12–8",
        phone: "(231) 223-4333",
        description: "Wood-fired pizza & house-smoked ribs on a bay-view patio",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=13512+Peninsula+Dr%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "The Boathouse",
        time: "6:30 pm",
        note: "target time, not yet booked — waitlisted via OpenTable notify alert",
        phone: "(231) 223-4030",
        description: "Upscale but unpretentious, right on West Bay",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=14039+Peninsula+Dr%2C+Traverse+City%2C+MI+49686",
      },
    ],
  },
  {
    id: "day-2",
    isoDate: "2026-09-06",
    day: "Day 2",
    date: "Sun, Sep 6",
    title: "Peninsula day — lighthouse, beach, wine trail",
    location: "Old Mission Peninsula",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Old+Mission+Peninsula%2C+MI",
    lat: 44.9,
    lng: -85.48,
    description: "Leave ~9:00 AM for the tip of the peninsula (~25–30 min drive).",
    clothing: "Light layers for a day outdoors — mornings cool, afternoons mild, wineries have shaded patios.",
    restaurants: [
      {
        name: "Old Mission General Store",
        time: "9:30 am",
        note: "coffee/pastry — 160-year-old country store, espresso bar and deli",
        phone: "(231) 223-4310",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=18250+Mission+Rd%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Old Mission Lighthouse Park",
        time: "10:15 am",
        note: "wooded trails, rocky shoreline, 45th parallel marker, lighthouse — park open until 10 PM",
        phone: "(231) 645-0759",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=20500+Center+Rd%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Haserot Beach Park",
        time: "11:30 am",
        note: "quiet sandy bay beach, mostly locals — grab lunch at the General Store first, or pack something",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Haserot+Beach+Park%2C+Old+Mission+Peninsula%2C+MI",
      },
      {
        name: "Scenic overlook, Center Rd (M-37)",
        time: "1:15 pm",
        note: "roadside pull-off just north of Bonobo Winery — both West and East Grand Traverse Bay at once",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bonobo+Winery%2C+12011+Center+Rd%2C+Traverse+City%2C+MI+49685",
      },
      {
        name: "Hawthorne Vineyards",
        time: "1:50 pm",
        note: "tasting, walk-ins fine — Sun–Thu 11–6, Fri–Sat 11–7",
        phone: "(231) 929-4206",
        description: "Boutique tasting room on a ridge overlooking both bays",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=1000+Camino+Maria+Dr%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Bowers Harbor Vineyards",
        time: "2:50 pm",
        note: "tasting, walk-ins fine — Sun–Thu 11–6, Fri–Sat 11–7",
        phone: "(231) 223-7615",
        description: "Tucked among 20 acres of vines, cozier and quieter",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=2896+Bowers+Harbor+Rd%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Bowers Harbor Park",
        time: "3:35 pm",
        note: "quick walk — paved shoreline trail looking out at Power Island",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=2750+Bowers+Harbor+Rd%2C+Traverse+City%2C+MI+49686",
      },
      {
        name: "Trattoria Stella",
        time: "7:15 pm",
        note: "confirmed via Resy, 2 guests — cancel by noon same day to avoid $25/guest fee",
        phone: "(231) 929-8989",
        description: "Locals' farm-to-table Italian in the historic Village at Grand Traverse Commons",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=830+Cottageview+Dr%2C+Traverse+City%2C+MI+49684",
      },
    ],
  },
  {
    id: "day-3",
    isoDate: "2026-09-07",
    day: "Day 3",
    date: "Mon, Sep 7",
    title: "Depart (Labor Day)",
    location: "North of Ordinary",
    mapsUrl: northOfOrdinary.mapsUrl,
    lat: 44.83,
    lng: -85.51,
    description: "Drive back to Wixom (~4 hrs) — expect more holiday traffic than usual.",
    hotelNote: "Checkout: North of Ordinary, 11:00 AM",
    hotel: northOfOrdinary,
    mealNote: "No reservations — grab something on the road",
  },
];
