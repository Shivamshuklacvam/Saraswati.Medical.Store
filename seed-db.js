const { initializeApp } = require('firebase/app');
const { initializeFirestore, collection, addDoc } = require('firebase/firestore');

// Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyB8bVi-dOFKJhMC6J9qX_S6dtww_lmxpH4",
    authDomain: "saraswati-medical.firebaseapp.com",
    projectId: "saraswati-medical",
    storageBucket: "saraswati-medical.firebasestorage.app",
    messagingSenderId: "166391875693",
    appId: "1:166391875693:web:0e99eea72ae814eafad764",
};

const PRODUCTS = [
    // MEDICINES (10)
    { name: "Paracetamol 500mg", brand: "Cipla", category: "Medicines", price: 32.5, mrp: 40, stock: 150, requiresPrescription: false, salt: "Paracetamol", packSize: "Strip of 10" },
    { name: "Amoxicillin 250mg", brand: "GSK", category: "Medicines", price: 120, mrp: 145, stock: 80, requiresPrescription: true, salt: "Amoxicillin", packSize: "6 Capsules" },
    { name: "Cetirizine 10mg", brand: "Alkem", category: "Medicines", price: 18, mrp: 25, stock: 200, requiresPrescription: false, salt: "Cetirizine Hydrochloride", packSize: "Strip of 10" },
    { name: "Ibuprofen 400mg", brand: "Abbott", category: "Medicines", price: 25, mrp: 35, stock: 120, requiresPrescription: false, salt: "Ibuprofen", packSize: "Strip of 10" },
    { name: "Azithromycin 500mg", brand: "Lupin", category: "Medicines", price: 71, mrp: 85, stock: 90, requiresPrescription: true, salt: "Azithromycin", packSize: "3 Tablets" },
    { name: "Metformin 500mg", brand: "Sun Pharma", category: "Medicines", price: 15, mrp: 22, stock: 300, requiresPrescription: true, salt: "Metformin Hydrochloride", packSize: "Strip of 10" },
    { name: "Amlodipine 5mg", brand: "Pfizer", category: "Medicines", price: 28, mrp: 45, stock: 250, requiresPrescription: true, salt: "Amlodipine Besylate", packSize: "Strip of 15" },
    { name: "Omeprazole 20mg", brand: "Dr. Reddys", category: "Medicines", price: 42, mrp: 60, stock: 180, requiresPrescription: true, salt: "Omeprazole", packSize: "15 Capsules" },
    { name: "Pantoprazole 40mg", brand: "Torrent", category: "Medicines", price: 85, mrp: 110, stock: 140, requiresPrescription: true, salt: "Pantoprazole Sodium", packSize: "10 Tablets" },
    { name: "Atorvastatin 10mg", brand: "Zydus", category: "Medicines", price: 55, mrp: 78, stock: 210, requiresPrescription: true, salt: "Atorvastatin Calcium", packSize: "Strip of 15" },

    // BABY CARE (10)
    { name: "Baby Powder 200g", brand: "Johnson's", category: "Baby Care", price: 210, mrp: 235, stock: 45, requiresPrescription: false, packSize: "Bottle" },
    { name: "Baby Diapers (S)", brand: "Pampers", category: "Baby Care", price: 699, mrp: 850, stock: 60, requiresPrescription: false, packSize: "Pack of 46" },
    { name: "Baby Lotion 100ml", brand: "Himalaya", category: "Baby Care", price: 125, mrp: 150, stock: 85, requiresPrescription: false, packSize: "Bottle" },
    { name: "Baby Shampoo 200ml", brand: "Johnson's", category: "Baby Care", price: 195, mrp: 220, stock: 40, requiresPrescription: false, packSize: "Bottle" },
    { name: "Baby Wipes (80s)", brand: "MamyPoko", category: "Baby Care", price: 145, mrp: 180, stock: 150, requiresPrescription: false, packSize: "Refill Pack" },
    { name: "Baby Massage Oil", brand: "Dabur Lal", category: "Baby Care", price: 215, mrp: 250, stock: 30, requiresPrescription: false, packSize: "200ml" },
    { name: "Baby Soap 75g", brand: "Sebamed", category: "Baby Care", price: 180, mrp: 210, stock: 55, requiresPrescription: false, packSize: "Bar" },
    { name: "Baby Cream 50g", brand: "Aveeno", category: "Baby Care", price: 450, mrp: 550, stock: 20, requiresPrescription: false, packSize: "Tube" },
    { name: "Diaper Rash Cream", brand: "Desitin", category: "Baby Care", price: 320, mrp: 380, stock: 35, requiresPrescription: false, packSize: "50g" },
    { name: "Baby Bottle Cleanser", brand: "Pigeon", category: "Baby Care", price: 275, mrp: 320, stock: 25, requiresPrescription: false, packSize: "500ml" },

    // DEVICES (10)
    { name: "Digital Thermometer", brand: "Dr. Trust", category: "Devices", price: 249, mrp: 350, stock: 100, requiresPrescription: false, packSize: "1 Unit" },
    { name: "Pulse Oximeter", brand: "BPL", category: "Devices", price: 1250, mrp: 1800, stock: 40, requiresPrescription: false, packSize: "1 Unit" },
    { name: "BP Monitor (Auto)", brand: "Omron", category: "Devices", price: 2450, mrp: 3200, stock: 30, requiresPrescription: false, packSize: "1 Unit" },
    { name: "Nebulizer Machine", brand: "Philips", category: "Devices", price: 2100, mrp: 2800, stock: 15, requiresPrescription: false, packSize: "Set" },
    { name: "Glucometer Kit", brand: "Accu-Chek", category: "Devices", price: 850, mrp: 1100, stock: 50, requiresPrescription: false, packSize: "Includes 10 Strips" },
    { name: "Vaporizer/Inhaler", brand: "Healthgenie", category: "Devices", price: 399, mrp: 600, stock: 80, requiresPrescription: false, packSize: "3-in-1 Unit" },
    { name: "Contactless IR Therm", brand: "Microtek", category: "Devices", price: 1850, mrp: 2500, stock: 25, requiresPrescription: false, packSize: "1 Unit" },
    { name: "Digital Scale", brand: "HealthSense", category: "Devices", price: 999, mrp: 1500, stock: 40, requiresPrescription: false, packSize: "1 Unit" },
    { name: "Surgical Mask (50)", brand: "Careview", category: "Devices", price: 150, mrp: 250, stock: 200, requiresPrescription: false, packSize: "Box" },
    { name: "Dispenser Unit", brand: "Dettol", category: "Devices", price: 899, mrp: 1200, stock: 15, requiresPrescription: false, packSize: "Automatic" },

    // BEAUTY (10)
    { name: "Hydro Boost Gel", brand: "Neutrogena", category: "Beauty", price: 950, mrp: 1100, stock: 15, requiresPrescription: false, packSize: "50g" },
    { name: "Vitamin C Serum", brand: "The Derma Co", category: "Beauty", price: 549, mrp: 649, stock: 45, requiresPrescription: false, packSize: "30ml" },
    { name: "Micellar Water", brand: "Garnier", category: "Beauty", price: 210, mrp: 250, stock: 60, requiresPrescription: false, packSize: "200ml" },
    { name: "Sunscreen SPF 50", brand: "La Shield", category: "Beauty", price: 720, mrp: 850, stock: 35, requiresPrescription: false, packSize: "60g" },
    { name: "Moisturizer 100g", brand: "Cetaphil", category: "Beauty", price: 425, mrp: 500, stock: 70, requiresPrescription: false, packSize: "Tube" },
    { name: "Foaming Face Wash", brand: "Mamaearth", category: "Beauty", price: 349, mrp: 399, stock: 50, requiresPrescription: false, packSize: "150ml" },
    { name: "Shea Lip Balm", brand: "The Body Shop", category: "Beauty", price: 245, mrp: 300, stock: 100, requiresPrescription: false, packSize: "Stick" },
    { name: "Night Repair Serum", brand: "Estee Lauder", category: "Beauty", price: 5900, mrp: 6500, stock: 5, requiresPrescription: false, packSize: "20ml" },
    { name: "Charcoal Face Mask", brand: "Wow Skin", category: "Beauty", price: 399, mrp: 499, stock: 40, requiresPrescription: false, packSize: "100g" },
    { name: "Under Eye Cream", brand: "MCaffeine", category: "Beauty", price: 475, mrp: 550, stock: 30, requiresPrescription: false, packSize: "30ml" },

    // WELLNESS (10)
    { name: "Zincovit Tabs", brand: "Apex", category: "Wellness", price: 105, mrp: 120, stock: 300, requiresPrescription: false, packSize: "15 Tablets" },
    { name: "Multivitamin Men", brand: "HealthKart", category: "Wellness", price: 499, mrp: 650, stock: 120, requiresPrescription: false, packSize: "60 Tablets" },
    { name: "Omega-3 Fish Oil", brand: "MuscleBlaze", category: "Wellness", price: 750, mrp: 900, stock: 80, requiresPrescription: false, packSize: "60 Capsules" },
    { name: "Vitamin D3 60K", brand: "Cadila", category: "Wellness", price: 35, mrp: 45, stock: 500, requiresPrescription: false, packSize: "1 Capsule" },
    { name: "Ashwagandha Cap", brand: "Patanjali", category: "Wellness", price: 160, mrp: 180, stock: 150, requiresPrescription: false, packSize: "60 Capsules" },
    { name: "Chyawanprash 500g", brand: "Dabur", category: "Wellness", price: 220, mrp: 250, stock: 100, requiresPrescription: false, packSize: "Jar" },
    { name: "Green Tea (25s)", brand: "Tetley", category: "Wellness", price: 145, mrp: 170, stock: 200, requiresPrescription: false, packSize: "Box" },
    { name: "Aloe Vera Juice", brand: "Baidyanath", category: "Wellness", price: 195, mrp: 230, stock: 60, requiresPrescription: false, packSize: "1 Litre" },
    { name: "Cal + Mag Tabs", brand: "Amway", category: "Wellness", price: 850, mrp: 950, stock: 40, requiresPrescription: false, packSize: "90 Tablets" },
    { name: "Biotin Supplements", brand: "Swisse", category: "Wellness", price: 1250, mrp: 1500, stock: 25, requiresPrescription: false, packSize: "60 Tablets" }
];

async function seed() {
    console.log("🚀 Initializing Seeding with 50 products...");
    const app = initializeApp(firebaseConfig);
    const db = initializeFirestore(app, {}, 'default');
    const colRef = collection(db, 'products');

    for (const product of PRODUCTS) {
        try {
            await addDoc(colRef, product);
            console.log(`✅ Added: ${product.name}`);
        } catch (e) {
            console.error(`❌ Error adding ${product.name}:`, e.message);
        }
    }
    console.log("\n✨ Seeding Complete! Database is now populated with variety.");
    process.exit(0);
}

seed();
