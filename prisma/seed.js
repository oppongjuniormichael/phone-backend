require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@phoneshop.com" },
    update: {},
    create: {
      email: "admin@phoneshop.com",
      password: passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  const samplePhones = [
    {
      title: "Apple iPhone 15 Pro Max",
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      condition: "New",
      price: 1299,
      stockQty: 8,
      sku: "IPH15PM-256-BLK",
      category: "iPhones",
      tags: "featured, pro, flagship",
      description: "Premium Apple device with titanium design and advanced camera system.",
      isFeatured: true,
      isPremium: true,
      warranty: "12 months",
      status: "Published",
      specs: [
        { name: "Storage", value: "256GB" },
        { name: "Display", value: "6.7-inch OLED" },
      ],
      images: [
        { url: "/images/iphone-15-pro-max.png", isCover: true, order: 0 },
      ],
    },
    {
      title: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      condition: "New",
      price: 1199,
      stockQty: 5,
      sku: "SGS24U-512-GRAY",
      category: "Samsung",
      tags: "android, premium",
      description: "High-end Android flagship built for productivity and photography.",
      isFeatured: true,
      isPremium: true,
      warranty: "12 months",
      status: "Published",
      specs: [
        { name: "Storage", value: "512GB" },
        { name: "Battery", value: "5000mAh" },
      ],
      images: [
        { url: "/images/galaxy-s24-ultra.png", isCover: true, order: 0 },
      ],
    },
    {
      title: "Google Pixel 8",
      brand: "Google",
      model: "Pixel 8",
      condition: "New",
      price: 699,
      stockQty: 12,
      sku: "GP8-128-OBS",
      category: "Google Pixel",
      tags: "android, camera",
      description: "Clean Android experience with excellent computational photography.",
      isFeatured: false,
      isPremium: false,
      warranty: "12 months",
      status: "Published",
      specs: [
        { name: "Storage", value: "128GB" },
        { name: "Chip", value: "Google Tensor G3" },
      ],
      images: [
        { url: "/images/pixel-8.png", isCover: true, order: 0 },
      ],
    },
  ];

  for (const phoneData of samplePhones) {
    await prisma.phone.upsert({
      where: { sku: phoneData.sku },
      update: {},
      create: {
        title: phoneData.title,
        brand: phoneData.brand,
        model: phoneData.model,
        condition: phoneData.condition,
        price: phoneData.price,
        stockQty: phoneData.stockQty,
        sku: phoneData.sku,
        category: phoneData.category,
        tags: phoneData.tags,
        description: phoneData.description,
        isFeatured: phoneData.isFeatured,
        isPremium: phoneData.isPremium,
        warranty: phoneData.warranty,
        status: phoneData.status,
        specs: { create: phoneData.specs },
        images: { create: phoneData.images },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });