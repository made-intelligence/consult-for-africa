/**
 * Stand up the family estate: three buildings and their units.
 *
 * Two on Banana Island (H18 and 502 Close) and one on Osborne Foreshore: five,
 * three and four, twelve units in total. Labelled APT 1 upwards within each
 * building, as the family says them.
 *
 * Idempotent: re-running updates the buildings in place and adds any unit that
 * is missing. It never deletes a unit, because a unit is what a ledger hangs off
 * and dropping one would take somebody's account history with it.
 *
 * Run: npx tsx --env-file=.env scripts/seed-estate.ts
 */

import { randomBytes } from "crypto";
import { PrismaClient, type EstateArea } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Opening rates. Both are meant to be changed from the founder side once there
 * are dips to calibrate against — the price especially, since Lagos AGO moved
 * between roughly ₦1,400 and over ₦2,000 a litre across 2025-26 and any figure
 * hardcoded here is wrong by the time it is read.
 */
const PRICE_PER_LITRE = 1800;
const LITRES_PER_HOUR = 10;

interface Seed {
  name: string;
  slug: string;
  area: EstateArea;
  address: string;
  /// Only the two Banana Island houses have one.
  hasPool: boolean;
  units: string[];
}

const BUILDINGS: Seed[] = [
  {
    name: "H18",
    slug: "h18",
    area: "BANANA_ISLAND",
    address: "House 18, Banana Island, Ikoyi, Lagos",
    hasPool: true,
    units: ["APT 1", "APT 2", "APT 3", "APT 4", "APT 5"],
  },
  {
    name: "502 Close",
    slug: "502-close",
    area: "BANANA_ISLAND",
    address: "502 Close, Banana Island, Ikoyi, Lagos",
    hasPool: true,
    units: ["APT 1", "APT 2", "APT 3"],
  },
  {
    name: "Osborne Foreshore",
    slug: "osborne",
    area: "OSBORNE_FORESHORE",
    address: "Osborne Foreshore Estate, Ikoyi, Lagos",
    hasPool: false,
    units: ["APT 1", "APT 2", "APT 3", "APT 4"],
  },
];

const ALLOCATION_NOTE =
  "Diesel is shared equally between the flats in this building. Each generator run is " +
  "logged when it is switched on and off; the hours are multiplied by the building's " +
  "litres-per-hour figure and the rate per litre in force on the day, and the total is " +
  "divided between the flats. Empty flats are carried by the landlord, not by you.";

async function main() {
  for (const seed of BUILDINGS) {
    const building = await prisma.estateBuilding.upsert({
      where: { slug: seed.slug },
      create: {
        name: seed.name,
        slug: seed.slug,
        area: seed.area,
        address: seed.address,
        hasPool: seed.hasPool,
        litresPerHour: LITRES_PER_HOUR,
        dieselPricePerLitre: PRICE_PER_LITRE,
        allocationNote: ALLOCATION_NOTE,
      },
      // Deliberately narrow. Re-running this must not stamp on a rate somebody
      // has since corrected from the founder side.
      update: { name: seed.name, area: seed.area, address: seed.address, hasPool: seed.hasPool },
      select: { id: true, name: true },
    });

    let created = 0;
    for (const label of seed.units) {
      const existing = await prisma.estateUnit.findUnique({
        where: { buildingId_label: { buildingId: building.id, label } },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.estateUnit.create({
        data: { buildingId: building.id, label, status: "VACANT" },
      });
      created++;
    }

    const total = await prisma.estateUnit.count({ where: { buildingId: building.id } });
    console.log(`${building.name}: ${total} units (${created} created)`);
  }

  // The service engineer, because the 200-hour reminder has nowhere to go
  // without somebody holding the role. Created across all three buildings with
  // no contact details — add his email from the founder side, or the reminder
  // can only ever appear on a screen.
  const engineer = await prisma.estateStaff.findFirst({
    where: { role: "SERVICE_ENGINEER", name: { contains: "Nurudeen" } },
    select: { id: true, email: true },
  });
  if (!engineer) {
    await prisma.estateStaff.create({
      data: {
        name: "Engr Nurudeen",
        role: "SERVICE_ENGINEER",
        accessToken: randomBytes(32).toString("base64url"),
      },
    });
    console.log("\nAdded Engr Nurudeen as service engineer across all three buildings.");
    console.log("He has no email yet, so the 200-hour reminder will not send. Add it at /founder/estate/people.");
  } else if (!engineer.email) {
    console.log("\nEngr Nurudeen still has no email, so the 200-hour reminder cannot send.");
  }

  const units = await prisma.estateUnit.count();
  console.log(`\nDone. ${BUILDINGS.length} buildings, ${units} units.`);
  console.log("Next: add tenants and ground team from /founder/estate/people to issue their links.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
