/**
 * Finish Dr Omotanwa Gbadebo's setup as a CFA consultant, the way
 * app/api/admin/users/route.ts does it, so she matches the other 69.
 *
 *   - a temporary password, so she can actually log in
 *   - a ConsultantProfile with the platform's own placeholders (title
 *     "Consultant", empty bio, location Nigeria, 0 years). These are what the
 *     admin route seeds and what she overwrites at /onboarding/profile. They
 *     are deliberately not guesses at her real background.
 *   - ConsultantOnboarding at INVITED
 *   - a NON-BILLABLE assignment to the Haven engagement, because Debo's call on
 *     6 Oct 2026 was that CFA carries her until the transformation closes and
 *     Haven takes her on
 *
 * ONE FIELD IS A PLACEHOLDER AND HAS TO BE SET: rateAmount is what CFA pays
 * her, which is not the same as what Haven is billed. Haven is billed nothing
 * (isBillable false), so the bill rate is correctly absent, but a cost rate of
 * zero understates our own cost and will do so in any utilisation or margin
 * report that reads it. It is printed loudly below until it is filled in.
 *
 * Idempotent. No email is sent here; the senders do that.
 *
 *   npx tsx --env-file=.env.local scripts/setup-gbadebo-consultant.ts
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "adebusayogbadebo@gmail.com";
const COST_RATE = 0; // <- placeholder. What CFA pays her.

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("No User. Run scripts/fix-gbadebo-is-cfa-consultant.ts first.");

  // Password, only if she has none, so a re-run never locks her out.
  let password: string | null = null;
  if (!user.passwordHash) {
    password = randomBytes(12).toString("base64url") + "!1A";
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log("set a temporary password");
  } else {
    console.log("• password already set, left alone");
  }

  const profile = await prisma.consultantProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      title: "Consultant",
      bio: "",
      location: "Nigeria",
      yearsExperience: 0,
      availabilityStatus: "AVAILABLE",
    },
    select: { id: true, title: true },
  });
  console.log(`ConsultantProfile: ${profile.title} (placeholders, she completes at /onboarding/profile)`);

  const onboarding = await prisma.consultantOnboarding.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, status: "INVITED", assessmentLevel: "STANDARD" },
    select: { status: true, assessmentLevel: true },
  });
  console.log(`Onboarding: ${onboarding.status}, assessment ${onboarding.assessmentLevel}`);

  const eng = await prisma.engagement.findFirst({
    where: { name: { contains: "Haven" } },
    select: { id: true, name: true, endDate: true },
  });
  if (!eng) throw new Error("Haven engagement not found.");

  const existing = await prisma.assignment.findFirst({
    where: { engagementId: eng.id, consultantId: user.id },
  });
  if (!existing) {
    await prisma.assignment.create({
      data: {
        engagementId: eng.id,
        consultantId: user.id,
        role: "Head of Operations (prospective)",
        responsibilities:
          "Runs Haven operations day to day on the CFA mandate. Owns four of the ten growth levers: " +
          "repricing the tariff and fixing capture, freeing the working capital, NICU occupancy and cot " +
          "turnover operationally, and the standards, roster and incentive work. Clinical decisions remain " +
          "with the Medical Director. Prospective Head of Operations at Haven once the transformation closes.",
        startDate: new Date("2026-10-06"),
        endDate: eng.endDate,
        status: "PENDING_ACCEPTANCE",
        allocationPct: 100,
        rateAmount: COST_RATE,
        rateCurrency: "NGN",
        rateType: "MONTHLY",
        isBillable: false,
      },
    });
    console.log(`Assignment created on "${eng.name}": 100%, non-billable`);
  } else {
    console.log("• assignment already exists, left alone");
  }

  console.log("\n" + "=".repeat(68));
  if (password) console.log(`  Temporary password: ${password}`);
  if (COST_RATE === 0) {
    console.log("  ACTION NEEDED: the assignment cost rate is 0. That is a placeholder,");
    console.log("  not a fact. Set COST_RATE to what CFA pays her and re-run, or edit the");
    console.log("  assignment in the platform. Haven is billed nothing either way.");
  }
  console.log("=".repeat(68));
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
