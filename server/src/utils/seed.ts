import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../config/db";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import Cart from "../models/Cart";
import PasswordResetToken from "../models/PasswordResetToken";

// Helper: build a reliable Unsplash URL
const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=80`;

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Cart.deleteMany({});
  await PasswordResetToken.deleteMany({});

  const adminHash = await bcrypt.hash("Admin@123", 10);
  const customerHash = await bcrypt.hash("Customer@123", 10);

  await User.create([
    { name: "Admin User",    email: "admin@smartcart.com",    passwordHash: adminHash,    role: "admin"    },
    { name: "Jane Customer", email: "customer@smartcart.com", passwordHash: customerHash, role: "customer" },
  ]);

  await Product.insertMany([
    // ── Electronics ────────────────────────────────────────────────────────
    {
      title: "Wireless Noise-Cancelling Headphones",
      description: "Over-ear headphones with active noise cancellation, 30-hour battery life, and plush memory-foam ear cushions.",
      highlights: ["Active noise cancellation", "30-hour battery", "Bluetooth 5.2"],
      category: "Electronics", price: 149.99, stock: 25,
      image: u("photo-1505740420928-5e560c06d30e"),
    },
    {
      title: "Smart Fitness Watch",
      description: "Track steps, heart rate, sleep, and workouts with a lightweight smartwatch and vibrant AMOLED display.",
      highlights: ["Heart rate monitor", "7-day battery", "Water resistant"],
      category: "Electronics", price: 89.99, stock: 40,
      image: u("photo-1523275335684-37898b6baf30"),
    },
    {
      title: "Mechanical Keyboard",
      description: "Compact TKL mechanical keyboard with Cherry MX Brown switches, RGB backlighting, and an aluminium frame.",
      highlights: ["Cherry MX Brown switches", "RGB backlight", "Tenkeyless layout"],
      category: "Electronics", price: 109.99, stock: 30,
      image: u("photo-1587829741301-dc798b83add3"),
    },
    {
      title: "USB-C Hub 7-in-1",
      description: "Expand connectivity with 4K HDMI, 3× USB-A, SD/MicroSD readers, and 100W PD charging.",
      highlights: ["4K HDMI output", "100W Power Delivery", "Plug-and-play"],
      category: "Electronics", price: 49.99, stock: 50,
      image: u("photo-1625842268584-8f3296236761"),
    },
    {
      title: "Portable Bluetooth Speaker",
      description: "360° surround sound speaker with 20-hour playtime and IPX7 waterproof rating.",
      highlights: ["IPX7 waterproof", "20-hour battery", "360° sound"],
      category: "Electronics", price: 59.99, stock: 35,
      image: u("photo-1608043152269-423dbba4e7e1"),
    },
    {
      title: "Wireless Charging Pad",
      description: "10W fast Qi-wireless charging pad compatible with iPhones, Android phones, and earbuds.",
      highlights: ["10W fast charge", "Qi universal", "LED status indicator"],
      category: "Electronics", price: 29.99, stock: 70,
      image: u("photo-1586953208448-b95a79798f07"),
    },
    {
      title: "4K Webcam",
      description: "Ultra HD webcam with auto-focus, built-in stereo mic, and privacy shutter for remote work and streaming.",
      highlights: ["4K 30fps", "Auto-focus", "Privacy shutter"],
      category: "Electronics", price: 129.99, stock: 22,
      image: u("photo-1611532736597-de2d4265fba3"),
    },
    {
      title: "Noise-Isolating Earbuds",
      description: "True wireless earbuds with ANC, 8-hour playback, and a compact charging case.",
      highlights: ["ANC earbuds", "8-hour playback", "IPX4 sweat-proof"],
      category: "Electronics", price: 79.99, stock: 45,
      image: u("photo-1590658268037-6bf12165a8df"),
    },
    {
      title: "Smart LED Desk Lamp",
      description: "Touch-controlled LED desk lamp with 5 colour temperatures and a built-in USB-A charging port.",
      highlights: ["5 colour modes", "Touch dimmer", "USB charging port"],
      category: "Electronics", price: 34.99, stock: 55,
      image: u("photo-1507473885765-e6ed057f782c"),
    },
    {
      title: "Gaming Mouse",
      description: "Lightweight gaming mouse with a 16,000 DPI sensor, 6 programmable buttons, and RGB lighting.",
      highlights: ["16,000 DPI sensor", "6 programmable buttons", "RGB lighting"],
      category: "Electronics", price: 54.99, stock: 38,
      image: u("photo-1527864550417-7fd91fc51a46"),
    },
    {
      title: "Portable SSD 1TB",
      description: "Ultra-fast 1TB external SSD, read speeds up to 1050 MB/s, shockproof with USB-C connectivity.",
      highlights: ["1050 MB/s read", "Shockproof", "USB-C & USB-A compatible"],
      category: "Electronics", price: 99.99, stock: 20,
      image: u("photo-1601737487795-dab272f52420"),
    },
    {
      title: "Laptop Stand Aluminium",
      description: "Adjustable aluminium laptop stand with 6 height settings, heat dissipation design, foldable for travel.",
      highlights: ["6 height settings", "Heat dissipation", "Foldable"],
      category: "Electronics", price: 39.99, stock: 45,
      image: u("photo-1593642632559-0c6d3fc62b89"),
    },
    // ── Fashion ──────────────────────────────────────────────────────────
    {
      title: "Minimalist Leather Backpack",
      description: "Durable water-resistant leather backpack with a padded laptop sleeve, perfect for work or travel.",
      highlights: ["Fits 15-inch laptop", "Water-resistant", "Genuine leather"],
      category: "Fashion", price: 74.50, stock: 15,
      image: u("photo-1553062407-98eeb64c6a62"),
    },
    {
      title: "Classic Aviator Sunglasses",
      description: "Polarised UV400 aviator sunglasses with a stainless-steel frame and scratch-resistant mineral lenses.",
      highlights: ["Polarised lenses", "UV400 protection", "Stainless steel frame"],
      category: "Fashion", price: 39.99, stock: 60,
      image: u("photo-1511499767150-a48a237f0083"),
    },
    {
      title: "Canvas Tote Bag",
      description: "Heavyweight 12 oz canvas tote with reinforced handles and an interior zip pocket.",
      highlights: ["12 oz canvas", "Interior zip pocket", "Reinforced handles"],
      category: "Fashion", price: 18.99, stock: 80,
      image: u("photo-1544816155-12df9643f363"),
    },
    {
      title: "Slim RFID Leather Wallet",
      description: "Minimalist RFID-blocking bifold wallet in full-grain leather, holds up to 8 cards.",
      highlights: ["RFID blocking", "Full-grain leather", "Holds 8 cards"],
      category: "Fashion", price: 29.99, stock: 55,
      image: u("photo-1627123424574-724758594e93"),
    },
    {
      title: "Merino Wool Scarf",
      description: "Soft 100% merino wool scarf in a versatile neutral tone, naturally odour-resistant and machine washable.",
      highlights: ["100% merino wool", "Machine washable", "Odour-resistant"],
      category: "Fashion", price: 34.99, stock: 42,
      image: u("photo-1520903920243-00d872a2d1c9"),
    },
    {
      title: "Crossbody Sling Bag",
      description: "Compact anti-theft crossbody bag with hidden zip pockets, cut-proof straps, and RFID-blocking lining.",
      highlights: ["Anti-theft design", "RFID-blocking lining", "Cut-proof strap"],
      category: "Fashion", price: 49.99, stock: 25,
      image: u("photo-1548036328-c9fa89d128fa"),
    },
    {
      title: "Leather Watch Strap",
      description: "Genuine calf-leather watch strap with quick-release pins, compatible with 20mm and 22mm lugs.",
      highlights: ["Quick-release pins", "20 & 22mm sizes", "Genuine calf leather"],
      category: "Fashion", price: 22.99, stock: 65,
      image: u("photo-1533139502658-0198f920d8e7"),
    },
    // ── Home & Kitchen ────────────────────────────────────────────────────
    {
      title: "Ceramic Pour-Over Coffee Set",
      description: "Hand-glazed ceramic pour-over dripper and matching mug for slow-brew coffee enthusiasts.",
      highlights: ["Hand-glazed ceramic", "Includes matching mug", "Fits standard filters"],
      category: "Home & Kitchen", price: 38.00, stock: 30,
      image: u("photo-1495474472287-4d71bcdd2085"),
    },
    {
      title: "Stainless Steel Water Bottle",
      description: "Double-wall insulated bottle — cold 24h or hot 12h. BPA-free and leak-proof.",
      highlights: ["24h cold / 12h hot", "BPA-free", "Leak-proof lid"],
      category: "Home & Kitchen", price: 24.99, stock: 60,
      image: u("photo-1602143407151-7111542de6e8"),
    },
    {
      title: "Cast Iron Skillet 10-inch",
      description: "Pre-seasoned 10-inch cast iron skillet, induction compatible and oven-safe to 500°F.",
      highlights: ["Pre-seasoned", "Induction compatible", "Oven-safe to 500°F"],
      category: "Home & Kitchen", price: 44.99, stock: 35,
      image: u("photo-1556909114-f6e7ad7d3136"),
    },
    {
      title: "French Press Coffee Maker",
      description: "34 oz borosilicate glass French press with a double-screen filter for rich, grit-free coffee.",
      highlights: ["34 oz capacity", "Double-screen filter", "Heat-resistant glass"],
      category: "Home & Kitchen", price: 27.99, stock: 50,
      image: u("photo-1544787219-7f47ccb76574"),
    },
    {
      title: "Aroma Diffuser",
      description: "Ultrasonic essential oil diffuser with 7-colour ambient lighting, 400ml tank, and auto shut-off.",
      highlights: ["400ml tank", "7-colour LED", "Auto shut-off"],
      category: "Home & Kitchen", price: 29.99, stock: 48,
      image: u("photo-1608571423902-eed4a5ad8108"),
    },
    {
      title: "Digital Kitchen Scale",
      description: "Precision kitchen scale — 0.1g accuracy, 11 lb capacity, tare function, tempered glass platform.",
      highlights: ["0.1g accuracy", "11 lb capacity", "Tare function"],
      category: "Home & Kitchen", price: 19.99, stock: 55,
      image: u("photo-1585771724684-38269d6639fd"),
    },
    {
      title: "Bamboo Cutting Board Set",
      description: "Set of 3 organic bamboo cutting boards in graduated sizes with juice grooves and non-slip feet.",
      highlights: ["Set of 3 sizes", "Juice grooves", "Non-slip feet"],
      category: "Home & Kitchen", price: 32.99, stock: 45,
      image: u("photo-1607664877338-a6e79e8e2e1f"),
    },
    {
      title: "Herb Garden Starter Kit",
      description: "Indoor herb kit with 5 seed varieties, biodegradable pots, organic soil, and a bamboo tray.",
      highlights: ["5 seed varieties", "Biodegradable pots", "Organic soil included"],
      category: "Home & Kitchen", price: 21.99, stock: 40,
      image: u("photo-1466692476868-aef1dfb1e735"),
    },
    {
      title: "Glass Meal Prep Containers",
      description: "10-piece BPA-free glass containers with airtight lids, microwave, oven, and dishwasher safe.",
      highlights: ["BPA-free glass", "Airtight lids", "Microwave & oven safe"],
      category: "Home & Kitchen", price: 36.99, stock: 38,
      image: u("photo-1490645935967-10de6ba17061"),
    },
    // ── Furniture ─────────────────────────────────────────────────────────
    {
      title: "Ergonomic Office Chair",
      description: "Mesh-backed ergonomic chair with adjustable lumbar support, armrests, and headrest.",
      highlights: ["Adjustable lumbar support", "Breathable mesh back", "Reclines to 135°"],
      category: "Furniture", price: 219.99, stock: 8,
      image: u("photo-1580480055273-228ff5388ef8"),
    },
    {
      title: "Standing Desk Converter",
      description: "Sit-stand desk converter with gas-spring lift, dual monitor support, and a spacious work surface.",
      highlights: ["Gas-spring lift", "Dual monitor support", "No tools needed"],
      category: "Furniture", price: 179.99, stock: 12,
      image: u("photo-1518455027359-f3f8164ba6bd"),
    },
    {
      title: "Floating Wall Shelf Set",
      description: "Set of 3 solid pine floating shelves with invisible brackets, rustic finish, 33 lb capacity each.",
      highlights: ["Set of 3", "Invisible brackets", "33 lb capacity each"],
      category: "Furniture", price: 54.99, stock: 20,
      image: u("photo-1595428774223-ef52624120d2"),
    },
    {
      title: "Bedside Nightstand",
      description: "Compact Scandinavian nightstand with a drawer and open shelf in an oak veneer finish.",
      highlights: ["Drawer + open shelf", "Oak veneer finish", "Easy self-assembly"],
      category: "Furniture", price: 89.99, stock: 14,
      image: u("photo-1555041469-a586c61ea9bc"),
    },
    {
      title: "Monitor Arm Desk Mount",
      description: "Full-motion single monitor arm for screens up to 32 inches, VESA compatible with cable management.",
      highlights: ["Up to 32-inch screens", "VESA 75/100", "Cable management"],
      category: "Furniture", price: 64.99, stock: 22,
      image: u("photo-1547082299-de196ea013d6"),
    },
    {
      title: "5-Tier Industrial Bookshelf",
      description: "Industrial-style bookshelf with steel frame and rustic wood panels, 200 lb total capacity.",
      highlights: ["5 tiers", "Steel + wood build", "200 lb capacity"],
      category: "Furniture", price: 129.99, stock: 10,
      image: u("photo-1600585152220-90363fe7e115"),
    },
    // ── Sports & Outdoors ─────────────────────────────────────────────────
    {
      title: "Foam Yoga Mat",
      description: "6mm thick non-slip yoga mat with alignment lines, moisture-wicking surface, and a carry strap.",
      highlights: ["6mm thick", "Non-slip surface", "Alignment lines"],
      category: "Sports & Outdoors", price: 26.99, stock: 65,
      image: u("photo-1544367567-0f2fcb009e0b"),
    },
    {
      title: "Resistance Band Set",
      description: "Set of 5 latex resistance bands in graduated tensions (10–50 lbs) for strength training and rehab.",
      highlights: ["5 resistance levels", "Natural latex", "Includes carry bag"],
      category: "Sports & Outdoors", price: 19.99, stock: 80,
      image: u("photo-1598289431512-b97b0917affc"),
    },
    {
      title: "Adjustable Dumbbell 20kg",
      description: "Space-saving dumbbell replacing 6 pairs — dial-select 2 to 20 kg in 2 kg increments.",
      highlights: ["2–20 kg range", "Replaces 6 pairs", "Dial-select weight"],
      category: "Sports & Outdoors", price: 189.99, stock: 10,
      image: u("photo-1517836357463-d25dfeac3438"),
    },
    {
      title: "Hydration Running Belt",
      description: "Lightweight running belt with two 10 oz bottles, zippered pouch, and reflective strips.",
      highlights: ["Two 10 oz bottles", "Reflective strips", "Adjustable fit"],
      category: "Sports & Outdoors", price: 23.99, stock: 45,
      image: u("photo-1552196563-55cd4e45efb3"),
    },
    {
      title: "USB Rechargeable Headlamp",
      description: "350-lumen headlamp with red night-vision mode, IPX4 water resistance, and tilt adjustment.",
      highlights: ["350 lumens", "Red night-vision", "USB rechargeable"],
      category: "Sports & Outdoors", price: 31.99, stock: 50,
      image: u("photo-1504280390367-361c6d9f38f4"),
    },
    {
      title: "Insulated Hiking Flask",
      description: "32 oz vacuum-insulated flask — cold 48h or hot 24h, leakproof and scratch-resistant.",
      highlights: ["48h cold / 24h hot", "32 oz capacity", "Scratch-resistant"],
      category: "Sports & Outdoors", price: 37.99, stock: 55,
      image: u("photo-1523362628745-0c100150b504"),
    },
    // ── Books & Stationery ────────────────────────────────────────────────
    {
      title: "Dotted Hardcover Notebook",
      description: "A5 dotted hardcover notebook — 200 ivory pages, lay-flat binding, elastic closure, ribbon bookmark.",
      highlights: ["200 ivory pages", "Lay-flat binding", "Elastic closure"],
      category: "Books & Stationery", price: 14.99, stock: 100,
      image: u("photo-1531346878377-a5be20888e57"),
    },
    {
      title: "Mechanical Pencil Set",
      description: "Set of 3 precision 0.3, 0.5, and 0.7mm mechanical pencils with metal grip and HB leads.",
      highlights: ["3 line widths", "Metal grip", "Includes HB leads"],
      category: "Books & Stationery", price: 17.99, stock: 70,
      image: u("photo-1585336261022-680e295ce3fe"),
    },
    {
      title: "Bamboo Desk Organiser",
      description: "Bamboo desktop organiser with 5 compartments for pens, sticky notes, phone, and mail.",
      highlights: ["5 compartments", "Sustainable bamboo", "Phone stand slot"],
      category: "Books & Stationery", price: 21.99, stock: 45,
      image: u("photo-1484557985045-edf25e7f0943"),
    },
    {
      title: "Watercolour Paint Set 48",
      description: "Professional 48-colour watercolour pan set with two brushes, mixing palette, and portable tin case.",
      highlights: ["48 vibrant colours", "Two brushes included", "Portable tin case"],
      category: "Books & Stationery", price: 28.99, stock: 35,
      image: u("photo-1513364776144-60967b0f800f"),
    },
    {
      title: "Weekly Planner Pad",
      description: "Tear-off 52-week planner with daily task lists, habit tracker, and notes column — undated.",
      highlights: ["52 weeks", "Habit tracker", "Undated — start anytime"],
      category: "Books & Stationery", price: 12.99, stock: 90,
      image: u("photo-1506784983877-45594efa4cbe"),
    },

    // ── Health & Beauty ───────────────────────────────────────────────────
    {
      title: "Jade Facial Roller",
      description: "Dual-ended natural jade facial roller to reduce puffiness, improve circulation, and aid serum absorption.",
      highlights: ["Natural jade stone", "Dual-ended", "Reduces puffiness"],
      category: "Health & Beauty", price: 16.99, stock: 75,
      image: u("photo-1598440947619-2c35fc9aa908"),
    },
    {
      title: "Silicone Face Cleanser Brush",
      description: "Sonic silicone facial cleansing brush with 3 speed modes, waterproof design, and USB charging.",
      highlights: ["Silicone bristles", "3 speed modes", "Waterproof"],
      category: "Health & Beauty", price: 39.99, stock: 40,
      image: u("photo-1522337360788-8b13dee7a37e"),
    },
    {
      title: "Vitamin C Brightening Serum",
      description: "20% Vitamin C serum with hyaluronic acid and vitamin E — fades dark spots and boosts collagen.",
      highlights: ["20% Vitamin C", "Hyaluronic acid", "Boosts collagen"],
      category: "Health & Beauty", price: 22.99, stock: 60,
      image: u("photo-1620916566398-39f1143ab7be"),
    },
    {
      title: "Adjustable Posture Corrector",
      description: "Figure-8 posture corrector in breathable neoprene, adjustable straps, unisex design.",
      highlights: ["Adjustable straps", "Breathable neoprene", "Unisex design"],
      category: "Health & Beauty", price: 19.99, stock: 55,
      image: u("photo-1571019614242-c5c5dee9f50b"),
    },
    {
      title: "3D Contoured Sleep Mask",
      description: "Contoured sleep eye mask with cooling gel insert, adjustable strap, and total blackout coverage.",
      highlights: ["3D contoured", "Cooling gel insert", "Total blackout"],
      category: "Health & Beauty", price: 13.99, stock: 85,
      image: u("photo-1586348943529-beaae6c28db9"),
    },
  ]);

  console.log("✅ Database seeded with 56 products!");
  console.log("Admin:    admin@smartcart.com    / Admin@123");
  console.log("Customer: customer@smartcart.com / Customer@123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
