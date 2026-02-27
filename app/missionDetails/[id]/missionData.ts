import { MissionData } from "./types";

export const missions: Record<string, MissionData> = {
  "1": {
    id: "1",
    name: "Mission Trip – Zambia 2025",
    country: "Zambia",
    countryFlag: "🇿🇲",
    city: "Lusaka",
    coverImage:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
    dateDisplay: "June 12 to 22, 2025",
    pricePerPerson: 1850,
    totalSpots: 20,
    spotsReserved: 8,
    description:
      "This mission in Zambia brings together a passionate team to support the rural communities of the Lusaka region. Over 10 days, volunteers will participate in mobile medical clinics, educational programs for children, and community empowerment workshops centered on hope and dignity.",
    objectives: [
      "Provide medical and humanitarian assistance to remote villages.",
      "Train local leaders to continue the efforts after the mission.",
      "Encourage youth through sports and artistic activities.",
    ],
    stats: [
      { label: "Communities supported", value: "5 villages" },
      { label: "Local participants", value: "120 youth" },
      { label: "Local partners", value: "Hope Zambia & Friends" },
      { label: "Years of commitment", value: "Since 2019" },
    ],
    practicalInfo: [
      { icon: "📅", label: "Dates", value: "June 12 to 22, 2025" },
      { icon: "📍", label: "Destination", value: "Lusaka, Zambia" },
      { icon: "💵", label: "Cost", value: "$1,850 per person" },
      { icon: "🛫", label: "Departure from", value: "Atlanta, USA" },
      { icon: "🏨", label: "Accommodation", value: "Guest house & mission camps" },
      { icon: "🍽", label: "Meals included", value: "Breakfast & dinner" },
      { icon: "💉", label: "Required vaccines", value: "Yellow fever, Hepatitis A" },
      {
        icon: "⚠️",
        label: "Requirements",
        value: "Mandatory pre-training + medical certificate",
      },
    ],
    timeline: [
      {
        day: "Day 1",
        title: "Arrival in Lusaka",
        details: "Welcome by the local team, settling in, and orientation briefing.",
      },
      {
        day: "Day 2",
        title: "Training & immersion",
        details: "Cultural and logistics training sessions, meeting with partners.",
      },
      {
        day: "Days 3-5",
        title: "Mobile clinics",
        details: "Deployment of medical teams and food support in the villages.",
      },
      {
        day: "Days 6-7",
        title: "Youth programs",
        details: "Sports, arts, and teaching sessions for youth.",
      },
      {
        day: "Day 8",
        title: "Community project",
        details: "Construction of a community space and training for local leaders.",
      },
      {
        day: "Day 9",
        title: "Celebration & testimonies",
        details: "Celebration with the villages and time for testimonies.",
      },
      {
        day: "Day 10",
        title: "Return",
        details: "Debrief, closing prayer, and flight back to Atlanta.",
      },
    ],
    leaders: [
      {
        name: "Marie Dupont",
        role: "Global coordinator",
        email: "marie.dupont@cfoc.org",
        phone: "+1 (404) 555-0184",
        avatar:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "James Banda",
        role: "Field leader - Hope Zambia",
        email: "james.banda@hopezambia.org",
        phone: "+260 97 555 0134",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "Rachel Mwewa",
        role: "Logistics lead",
        email: "rachel.mwewa@cfoc.org",
        phone: "+260 96 555 0441",
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
    ],
    documents: [
      {
        title: "Registration form",
        description: "Official form to confirm your participation.",
        link: "https://example.com/zambia-mission-registration.pdf",
      },
      {
        title: "Medical form",
        description: "To be completed by your doctor before departure.",
        link: "https://example.com/zambia-medical-form.pdf",
      },
      {
        title: "Logistics guide",
        description: "Practical information: luggage, attire, local transport.",
        link: "https://example.com/zambia-logistics-guide.pdf",
      },
      {
        title: "Full schedule",
        description: "Day-by-day details of the mission.",
        link: "https://example.com/zambia-detailed-planning.pdf",
      },
    ],
    testimonials: [
      {
        quote:
          "Taking part in this mission transformed me. Seeing hope reborn in the villages reminded me why I serve.",
        author: "Lucie, volunteer 2023",
        role: "Volunteer nurse",
      },
      {
        quote:
          "Thanks to the CFOC team, our community now has access to lasting support. We are no longer alone.",
        author: "Pastor Emmanuel",
        role: "Community leader",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Village in Zambia",
      },
      {
        src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Outdoor mobile clinic",
      },
      {
        src: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Youth taking part in a workshop",
      },
      {
        src: "https://images.unsplash.com/photo-1542546068979-b6affb46ea91?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Team prayer time",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Jamaica Mission Trip 2026",
    country: "Kenya",
    countryFlag: "🇰🇪",
    city: "Nakuru",
    coverImage:
      "https://images.unsplash.com/photo-1592838064574-053248d79d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
    dateDisplay: "July 3 to 10, 2026",
    startDate: "2026-07-03",
    endDate: "2026-07-10",
    pricePerPerson: 1950,
    totalSpots: 18,
    spotsReserved: 10,
    description:
      "Join a team of doctors, nurses, and volunteers for a holistic mission serving the communities of the Rift Valley. Together we run pop-up clinics, hygiene workshops, and times of prayer with local families.",
    objectives: [
      "Provide free access to basic medical care.",
      "Train community liaisons on first aid and hygiene.",
      "Support local churches in their youth programs.",
    ],
    stats: [
      { label: "Expected patients", value: "400+" },
      { label: "Mobile clinics", value: "6 villages" },
      { label: "Partners", value: "Nakuru Hope Center" },
      { label: "Languages", value: "English & Swahili" },
    ],
    practicalInfo: [
      { icon: "📅", label: "Dates", value: "July 3 to 10, 2026" },
      { icon: "📍", label: "Destination", value: "Nakuru, Kenya" },
      { icon: "💵", label: "Cost", value: "$1,950 per person" },
      { icon: "🛫", label: "Departure from", value: "Paris, France" },
      { icon: "🏨", label: "Accommodation", value: "Partner guest house" },
      { icon: "🍽", label: "Meals included", value: "3 local meals per day" },
      { icon: "💉", label: "Required vaccines", value: "Yellow fever, Typhoid, Hepatitis B" },
      {
        icon: "⚠️",
        label: "Requirements",
        value: "Medical experience preferred + health clearance letter",
      },
    ],
    timeline: [
      {
        day: "Day 1",
        title: "Arrival in Nairobi",
        details: "International flight, welcome overnight stay, and safety briefing.",
      },
      {
        day: "Day 2",
        title: "Travel to Nakuru",
        details: "Visit the partner center and assign the medical teams.",
      },
      {
        day: "Days 3-5",
        title: "Rural clinics",
        details: "Consultations, mobile pharmacy, and hygiene workshops in the villages.",
      },
      {
        day: "Day 6",
        title: "Youth program",
        details: "Sports tournaments, wellness workshops, and mentoring sessions.",
      },
      {
        day: "Day 7",
        title: "Community sabbath",
        details: "Worship service, testimonies, and meal basket distribution.",
      },
      {
        day: "Days 8-9",
        title: "Specialized clinics",
        details: "Follow-up for identified cases, prenatal workshops, and maternal health support.",
      },
      {
        day: "Day 10",
        title: "Return & debrief",
        details: "Final debrief, prayer, and flight back to Paris.",
      },
    ],
    leaders: [
      {
        name: "Dr. Samuel Njoroge",
        role: "Medical lead",
        email: "samuel.njoroge@cfoc.org",
        phone: "+254 712 555 901",
        avatar:
          "https://images.unsplash.com/photo-1544723795-432537039519?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "Elise Martin",
        role: "Logistics coordinator",
        email: "elise.martin@cfoc.org",
        phone: "+33 6 44 55 01 03",
        avatar:
          "https://images.unsplash.com/photo-1546539782-6fc531453083?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "Pastor Daniel Mwangi",
        role: "Local liaison",
        email: "daniel.mwangi@nakuruhope.org",
        phone: "+254 722 444 120",
        avatar:
          "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
    ],
    documents: [
      {
        title: "Registration form",
        description: "Confirm your participation and medical information.",
        link: "https://example.com/kenya-registration.pdf",
      },
      {
        title: "Medical checklist",
        description: "Vaccines, sample prescription, and emergency protocol.",
        link: "https://example.com/kenya-medical-checklist.pdf",
      },
      {
        title: "Volunteer guide",
        description: "Local culture, recommended attire, luggage details.",
        link: "https://example.com/kenya-volunteer-guide.pdf",
      },
      {
        title: "Detailed schedule",
        description: "Your days hour by hour.",
        link: "https://example.com/kenya-daily-planning.pdf",
      },
    ],
    testimonials: [
      {
        quote:
          "The mobile clinics were a miracle for families. Seeing mothers reassured and children smiling is priceless.",
        author: "Claire, volunteer 2024",
        role: "Midwife",
      },
      {
        quote:
          "This mission awakened hope within our church. Thank you for this faithful partnership.",
        author: "Reverend Peter",
        role: "Local pastor",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1520597512845-0962cf30cf81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Outdoor medical consultations",
      },
      {
        src: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Volunteer team with children",
      },
      {
        src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Meal distribution in the Rift Valley",
      },
      {
        src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Prayer time with families",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Haiti Youth Revival 2025",
    country: "Haïti",
    countryFlag: "🇭🇹",
    city: "Port-au-Prince",
    coverImage:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
    dateDisplay: "September 3 to 13, 2025",
    pricePerPerson: 1650,
    totalSpots: 22,
    spotsReserved: 9,
    description:
      "This mission in Haiti supports local churches and youth centers through creative programs, food distributions, and personal development workshops. We long to see a new generation rise up with hope.",
    objectives: [
      "Train 60 young leaders on themes of hope and service.",
      "Renovate a welcome center for children and teenagers.",
      "Provide psychosocial and spiritual support to displaced families.",
    ],
    stats: [
      { label: "Youth served", value: "200" },
      { label: "Meals distributed", value: "1 500" },
      { label: "Local partners", value: "CFEC Ministries" },
      { label: "Years in Haiti", value: "Since 2014" },
    ],
    practicalInfo: [
      { icon: "📅", label: "Dates", value: "September 3 to 13, 2025" },
      { icon: "📍", label: "Destination", value: "Port-au-Prince, Haiti" },
      { icon: "💵", label: "Cost", value: "$1,650 per person" },
      { icon: "🛫", label: "Departure from", value: "Miami, USA" },
      { icon: "🏨", label: "Accommodation", value: "Secure guest house" },
      { icon: "🍽", label: "Meals included", value: "Breakfast & dinner" },
      { icon: "💉", label: "Required vaccines", value: "Yellow fever + antimalarial treatment" },
      {
        icon: "⚠️",
        label: "Requirements",
        value: "Intercultural training + team interview",
      },
    ],
    timeline: [
      {
        day: "Day 1",
        title: "Arrival in Haiti",
        details: "Welcome by the CFEC team, settling in, and safety orientation.",
      },
      {
        day: "Day 2",
        title: "Cultural immersion",
        details: "Visit the partner neighborhood and meet youth leaders.",
      },
      {
        day: "Days 3-5",
        title: "Youth workshops",
        details: "Leadership, art, sports sessions, and small-group mentoring.",
      },
      {
        day: "Day 6",
        title: "Construction & renovation",
        details: "Painting, repairing classrooms, and restoring the sports field.",
      },
      {
        day: "Day 7",
        title: "Family day",
        details: "Food distribution, basic care, and times of prayer.",
      },
      {
        day: "Day 8",
        title: "Impact outing",
        details: "Mobile program in a displaced persons camp in Croix-des-Bouquets.",
      },
      {
        day: "Day 9",
        title: "Closing celebration",
        details: "Celebration with testimonies, worship, and certificate ceremony.",
      },
      {
        day: "Day 10",
        title: "Return & celebration",
        details: "Debrief, fellowship, and flight back to Miami.",
      },
    ],
    leaders: [
      {
        name: "Naomi Pierre",
        role: "CFOC Haiti coordinator",
        email: "naomi.pierre@cfoc.org",
        phone: "+509 35 55 88 22",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "Michael Johnson",
        role: "Youth coach",
        email: "michael.johnson@cfoc.org",
        phone: "+1 (305) 555-7620",
        avatar:
          "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "Pastor André Louis",
        role: "Pastoral advisor",
        email: "andre.louis@cfec.ht",
        phone: "+509 48 56 19 34",
        avatar:
          "https://images.unsplash.com/photo-1504593811423-6dd665756598?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
    ],
    documents: [
      {
        title: "Enrollment form",
        description: "Contact details, commitment, and parental permissions.",
        link: "https://example.com/haiti-intake.pdf",
      },
      {
        title: "Safety plan",
        description: "Travel protocols, guidelines, and key numbers.",
        link: "https://example.com/haiti-security-plan.pdf",
      },
      {
        title: "Logistics guide",
        description: "Details on luggage, attire, currency, and communication.",
        link: "https://example.com/haiti-logistics-guide.pdf",
      },
      {
        title: "Detailed program",
        description: "Day-by-day schedule with youth activities.",
        link: "https://example.com/haiti-detailed-schedule.pdf",
      },
    ],
    testimonials: [
      {
        quote:
          "The young people rediscovered joy and a vision for the future. This mission brought light and solidarity.",
        author: "Sister Myriam",
        role: "Coordinatrice CFEC",
      },
      {
        quote:
          "I will never forget the shining faces after our performance. God moved powerfully.",
        author: "Jonas, volontaire 2024",
        role: "Creative facilitator",
      },
    ],
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Group of youth in worship",
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Colorful neighborhood in Port-au-Prince",
      },
      {
        src: "https://images.unsplash.com/photo-1508193638397-1c4234db14e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Creative workshop for children",
      },
      {
        src: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        alt: "Volunteer team in action",
      },
    ],
  },
};

missions["zambia-2025"] = missions["1"];
missions["kenya-2025"] = missions["2"];
missions["haiti-2025"] = missions["3"];
