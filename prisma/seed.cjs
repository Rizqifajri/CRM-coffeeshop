/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.customer.count();
  if (existing > 0) {
    console.log("Seed skipped, customers already exist.");
    return;
  }

  await prisma.customer.createMany({
    data: [
      {
        name: "Andi Sweet",
        contact: "6281230001111",
        favoriteDrink: "Caramel Macchiato",
        interestTags: ["sweet drinks", "caramel", "iced"],
        notes: "Always asks for extra caramel and extra ice.",
      },
      {
        name: "Budi Oat",
        contact: "budi.oat@example.com",
        favoriteDrink: "Oat Milk Latte",
        interestTags: ["oat milk", "latte", "non-dairy"],
        notes: "Prefers plant-based options.",
      },
      {
        name: "Citra Pastry",
        contact: "6281299990000",
        favoriteDrink: "Flat White",
        interestTags: ["pastry lover", "morning buyer", "sweet snacks"],
        notes: "Often buys croissant with coffee before 9am.",
      },
      {
        name: "Dewi Artistik",
        contact: "dewi.art@example.com",
        favoriteDrink: "Matcha Latte",
        interestTags: ["workshop", "latte art", "creative"],
        notes: "Interested in latte-art and coffee brewing classes.",
      },
      {
        name: "Eko Espresso",
        contact: "628111222333",
        favoriteDrink: "Double Espresso",
        interestTags: ["strong coffee", "morning buyer"],
        notes: "Likes short, strong shots and quick service.",
      },
      {
        name: "Fani Weekend",
        contact: "fani.weekend@example.com",
        favoriteDrink: "Caramel Cold Brew",
        interestTags: ["sweet drinks", "weekend", "cold brew"],
        notes: "Usually comes with friends on weekends.",
      },
      {
        name: "Gilang Remote",
        contact: "628555666777",
        favoriteDrink: "Oat Spanish Latte",
        interestTags: ["oat milk", "remote worker", "wifi"],
        notes: "Stays long, likes comfy seating and power outlets.",
      },
      {
        name: "Hana Healthy",
        contact: "hana.healthy@example.com",
        favoriteDrink: "Iced Americano",
        interestTags: ["less sugar", "non-dairy", "iced"],
        notes: "Asks for low/no sugar and lighter options.",
      },
    ],
  });

  console.log("Database seeded with sample customers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


