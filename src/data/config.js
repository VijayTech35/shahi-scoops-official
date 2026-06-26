export const config = {
  whatsappNumber: "916204373073",
  phoneDisplay: "+91 62043 73073",
  email: "hello@shahiscoops.com",
  address: "Maanyata Stay Pg, 4th Main Road, Opposite HKBK Engineering College, Vyalikaval HBCS Layout, Nagawara, Bengaluru – 560045",
  businessHours: "Mon – Sun · 10:00 AM – 11:00 PM",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  brand: {
    name: "Shahi Scoops",
    tagline: "India's Premium Ice Cream Brand",
    since: "2014",
    customers: "50,000+",
    rating: "4.9",
  },
}

export const waUrl = (text) => `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`
