import { addProduct } from './firebase/db';

const PRODUCTS = [
    // MEDICINES
    {
        name: "Paracetamol 500mg",
        brand: "Cipla",
        category: "Medicines",
        salt: "Paracetamol",
        price: 32.50,
        mrp: 40.00,
        packSize: "Strip of 10 Tablets",
        requiresPrescription: false,
        stock: 150,
        sku: "MED-PARA-500",
        description: "Effective relief from fever and mild to moderate pain.",
        uses: "Fever, Headache, Body pain",
        sideEffects: "Nausea, skin rash in rare cases",
        storage: "Store in a cool, dry place away from direct sunlight."
    },
    {
        name: "Amoxicillin 250mg",
        brand: "GlaxoSmithKline",
        category: "Medicines",
        salt: "Amoxicillin",
        price: 120.00,
        mrp: 145.00,
        packSize: "Strip of 6 Capsules",
        requiresPrescription: true,
        stock: 80,
        sku: "MED-AMOX-250",
        description: "A penicillin-type antibiotic used to treat various bacterial infections.",
        uses: "Bacterial infections of ear, nose, throat, and skin",
        sideEffects: "Diarrhea, nausea, vomiting",
        storage: "Keep away from children. Store below 30°C."
    },
    {
        name: "Cetirizine 10mg",
        brand: "Dr. Reddy's",
        category: "Medicines",
        salt: "Cetirizine Hydrochloride",
        price: 18.00,
        mrp: 22.00,
        packSize: "Strip of 10 Tablets",
        requiresPrescription: false,
        stock: 200,
        sku: "MED-CETI-10",
        description: "Anti-allergic medication for common cold and allergy symptoms.",
        uses: "Running nose, watery eyes, sneezing, itching",
        sideEffects: "Sleepiness, dry mouth",
        storage: "Protect from moisture and heat."
    },

    // BABY CARE
    {
        name: "Baby Bedtime Powder 200g",
        brand: "Johnson's",
        category: "Baby Care",
        price: 210.00,
        mrp: 235.00,
        packSize: "Plastic Bottle",
        requiresPrescription: false,
        stock: 45,
        sku: "BABY-POW-200",
        description: "Helps baby sleep better and keeps skin comfortable.",
        uses: "Absorbs excess moisture and reduces friction",
        storage: "Store in a cool place. Close lid after use."
    },
    {
        name: "Premium Soft Diapers (L)",
        brand: "Pampers",
        category: "Baby Care",
        price: 899.00,
        mrp: 1199.00,
        packSize: "Pack of 64 Pants",
        requiresPrescription: false,
        stock: 30,
        sku: "BABY-DIA-64",
        description: "Ultra-absorbent diapers for continuous dryness and comfort.",
        uses: "Baby hygiene",
        storage: "Store in a dry place."
    },

    // BEAUTY
    {
        name: "Oil-Free Acne Wash 175ml",
        brand: "Neutrogena",
        category: "Beauty",
        price: 540.00,
        mrp: 599.00,
        packSize: "Pump Bottle",
        requiresPrescription: false,
        stock: 25,
        sku: "BEAU-FACE-175",
        description: "Clinically proven to clear breakouts and blackheads.",
        uses: "Facial cleansing, acne prevention",
        storage: "External use only."
    },
    {
        name: "Hydro Boost Water Gel",
        brand: "Neutrogena",
        category: "Beauty",
        price: 950.00,
        mrp: 1100.00,
        packSize: "50g Jar",
        requiresPrescription: false,
        stock: 15,
        sku: "BEAU-GEL-50",
        description: "Hyaluronic acid enriched moisturizer for dry skin.",
        uses: "Skin hydration",
        storage: "Store in a cool place."
    },

    // WELLNESS
    {
        name: "Zincovit Multivitamins",
        brand: "Apex",
        category: "Wellness",
        price: 105.00,
        mrp: 120.00,
        packSize: "Strip of 15 Tablets",
        requiresPrescription: false,
        stock: 300,
        sku: "WELL-ZINC-15",
        description: "Daily supplement with vitamins, minerals, and grape seed extract.",
        uses: "Immunity boost, nutritional deficiency",
        storage: "Store in a dry place."
    },
    {
        name: "Omega-3 Fish Oil 1000mg",
        brand: "Wow Life Science",
        category: "Wellness",
        price: 649.00,
        mrp: 799.00,
        packSize: "60 Softgels",
        requiresPrescription: false,
        stock: 50,
        sku: "WELL-OMEG-60",
        description: "High potency EPA and DHA for heart and brain health.",
        uses: "Cholesterol management, joint health",
        storage: "Refrigerate after opening for best results."
    },

    // DEVICES
    {
        name: "Digital Thermometer",
        brand: "Dr. Trust",
        category: "Devices",
        price: 249.00,
        mrp: 350.00,
        packSize: "1 Unit",
        requiresPrescription: false,
        stock: 100,
        sku: "DEV-THER-01",
        description: "Highly accurate digital reading in 60 seconds.",
        uses: "Body temperature measurement",
        storage: "Keep in protective case."
    },
    {
        name: "Automatic BP Monitor",
        brand: "Omron",
        category: "Devices",
        price: 1850.00,
        mrp: 2400.00,
        packSize: "1 Unit Box",
        requiresPrescription: false,
        stock: 20,
        sku: "DEV-BPM-01",
        description: "Upper arm blood pressure monitor with Intellisense technology.",
        uses: "Blood pressure and pulse rate monitoring",
        storage: "Avoid moisture and extreme heat."
    },
];

export const seedProducts = async () => {
    console.log("Starting seeding products...");
    let count = 0;
    for (const prod of PRODUCTS) {
        try {
            await addProduct(prod);
            count++;
            console.log(`Added: ${prod.name}`);
        } catch (e) {
            console.error(`Failed to add ${prod.name}:`, e);
        }
    }
    console.log(`Seeding complete. Added ${count} products.`);
    return count;
};
