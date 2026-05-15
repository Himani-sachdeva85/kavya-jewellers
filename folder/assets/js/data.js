const PRODUCTS = [];

const categories = ["Bridal", "Gold", "Diamond", "Silver", "Antique"];
const prefixes = ["Royal", "Elegant", "Classic", "Divine", "Lustrous", "Majestic", "Vintage", "Eternal", "Celestial", "Radiant"];
const types = ["Necklace Set", "Earrings", "Bangle", "Ring", "Choker", "Bracelet", "Maang Tikka", "Anklet", "Nose Ring", "Pendant"];

// High quality placeholder images from Unsplash
const images = {
    "Bridal": "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=600&auto=format&fit=crop",
    "Gold": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
    "Diamond": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600&auto=format&fit=crop",
    "Silver": "https://images.unsplash.com/photo-1535633302704-5043dd58576e?q=80&w=600&auto=format&fit=crop",
    "Antique": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=600&auto=format&fit=crop"
};

for (let i = 1; i <= 100; i++) {
    const category = categories[i % categories.length];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    PRODUCTS.push({
        id: i,
        name: `${prefix} ${category} ${type}`,
        price: 15000 + (i * 2500) + Math.floor(Math.random() * 1000),
        category: category,
        type: type,
        description: `Experience the timeless beauty of our ${prefix} ${category} ${type}. Crafted with precision and passion for your most special moments.`,
        image: images[category],
        featured: i <= 8 // First 8 are featured
    });
}
