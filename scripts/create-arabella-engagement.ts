/**
 * Create the platform records for the Arabella Women's Health diagnostic audit:
 * client, engagement C4A-2026-008, the two payment milestones, invoice
 * CFA-ARA-2026-001 at N1,300,000, and the confirmed N780,000 mobilisation
 * payment received 28 September 2026.
 *
 * Idempotent: upserts the client by name, the engagement by engagementCode and
 * the invoice by invoiceNumber, then rebuilds the milestones, line items and
 * payment rows beneath them. Usage:
 *   npx tsx --env-file=.env.local scripts/create-arabella-engagement.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLIENT_NAME = "Arabella Women's Health";
const ENGAGEMENT_CODE = "C4A-2026-008";
const INVOICE_NUMBER = "CFA-ARA-2026-001";

const FEE = 1_300_000;
const MOBILISATION = 780_000; // 60%
const BALANCE = 520_000; // 40%

const MOBILISATION_PAID = new Date("2026-09-28");
const INVOICE_ISSUED = new Date("2026-09-28");
const ON_SITE = new Date("2026-10-02");
const DIAGNOSTIC_DUE = new Date("2026-10-16"); // end of week 2
const BALANCE_DUE = new Date("2026-11-02"); // month 2, per the revised commercial
const PHASE_END = new Date("2026-11-30");

const CLIENT_NOTES_INTERNAL = [
  "Dr Chito Nwana, principal and lead clinician. Tolu is Chief of Staff and the expected day to day",
  "point of contact. Asokoro, Abuja. A new CAC entity succeeding Tabitha Medical Centre.",
  "",
  "EMAIL AND PHONE ARE NOT RECORDED ANYWHERE IN THE REPO OR THE PROPOSAL FILES and have been left",
  "blank rather than guessed. Fill them in before pointing any send script or portal invitation at",
  "this record.",
  "",
  "Service lines: premium maternity packages, minimal access gynaecology surgery, fertility and ART,",
  "wellness and medspa, pharmacy. Estimated revenue baseline at engagement N8m/month, to be confirmed",
  "and agreed in week one. An existing patient database of 3,000+ records carried over from Tabitha.",
  "HERcast is Dr Nwana's own podcast and is treated as an owned channel in the growth case.",
].join("\n");

const ENGAGEMENT_DESCRIPTION = [
  "Two month foundation phase inside Arabella Women's Health, on site from Friday 2 October 2026.",
  "Establishes what the business earns today, where patients and money leak out between first enquiry",
  "and bank account, and whether the operation can carry the premium promise the brand is about to make.",
  "",
  "Deliverables: a written operations and commercial diagnostic by end of week two covering revenue by",
  "payer, billing leakage, pharmacy and formulary, staff task compliance and patient database quality;",
  "a technology and records review in week one with a prioritised roadmap; an agreed revenue baseline;",
  "the payer transition file and successor provider introduction package for Dr Nwana's signature;",
  "operations platform deployment with all patient facing staff trained by end of week two.",
  "",
  "The audit is the gate to the management contract that follows from month three at 7.5% of monthly",
  "revenue with a N750,000 floor in the early months.",
].join("\n");

const ENGAGEMENT_NOTES = [
  "COMMERCIALS. Fee N1,300,000. Mobilisation 60% (N780,000) invoiced and received 28 September 2026.",
  "Balance 40% (N520,000) outstanding, dated to month two in line with the revised commercial proposal.",
  "THE TRIGGER FOR THE BALANCE IS NOT STATED ANYWHERE IN WRITING and needs confirming with Dr Nwana.",
  "",
  "THE FEE MOVED AND THE SCOPE DID NOT. CFA_Arabella_Revised_Commercial.pdf (5 August 2026) prices this",
  "audit at N1,500,000 in two instalments of N750,000 and builds that number from exactly four paid line",
  "items: digital marketing strategy and setup N500,000, PR strategy and press materials N250,000,",
  "pharmacy supply audit and onboarding N350,000, clinical secondment induction N400,000. Everything",
  "else in the phase is complimentary against a stated market value, N4,550,000 of value against the",
  "N1,500,000 charged. The deal closed at N1,300,000 and it is not recorded which of the four paid items",
  "absorbed the N200,000, so as written CFA owes N1,500,000 of named deliverables for N1,300,000.",
  "Resolve before the balance conversation.",
  "",
  "STAFFING SOLD, WHICH IS A COMMITMENT NOT A CV PAGE. Kola Momodu named as on site project owner five",
  "days a week from day one. A seconded Head of Quality and Clinical Operations is sold as a specific",
  "candidate confirmed and briefed before engagement start, and no candidate is named anywhere.",
  "",
  "A LIVE DASHBOARD AT app.consultforafrica.com/arabella/dashboard IS PROMISED IN THE PROPOSAL, mocked",
  "down to named pipeline rows, and the 7.5% management fee from month three is explicitly calculated",
  "from it. That route does not exist. It is a billing dependency, not a nicety.",
  "",
  "THE SUCCESSION IS THE CENTRAL AUDIT QUESTION. Arabella is a separate legal entity from Tabitha, and",
  "that succession is asked to carry three claims at once: the HMO panels treat Arabella as the",
  "continuation of Tabitha for tariff purposes, patients meet Arabella as a new premium brand, and the",
  "reactivation of the existing base depends on the new company lawfully contacting the old company's",
  "patients. Section A of the information request exists to find out whether one consistent set of",
  "documents supports all three.",
  "",
  "Source documents: docs/arabella/. The two operative proposals were built in claude.ai rather than",
  "this repo and were recovered from ~/Downloads on 28 September 2026.",
].join("\n");

const INVOICE_CLIENT_NOTES = [
  "Diagnostic audit, two month foundation phase. Total fee N1,300,000.",
  "Payment: 60% (N780,000) on mobilisation, received 28 September 2026 with thanks.",
  "Balance 40% (N520,000) due in month two of the phase.",
  "",
  "Terms: fees are non-refundable once mobilisation has been received and the team has been assigned.",
  "Consult for Africa will substitute any named team member at no charge if they become unavailable,",
  "and will reschedule the engagement once at no charge on reasonable notice.",
].join("\n");

const INVOICE_INTERNAL_NOTES = [
  "Invoice issued by Debo from outside this repo on 28 September 2026, so there is no build script and",
  "no PDF in docs/ for it. THE NON-REFUNDABLE TERM, FREE SUBSTITUTION AND ONE FREE RESCHEDULE ARE",
  "RECORDED IN clientNotes HERE BUT IT IS NOT CONFIRMED THAT THE EMAILED PDF CARRIES THEM. Check the",
  "sent document and reissue from a build script if it differs, so the portal and the client's copy",
  "match. Dr Uju Rapu asked for a refund against an invoice that was silent on this.",
  "",
  "Modelled as one invoice for the full N1,300,000 at PARTIALLY_PAID rather than a MOBILIZATION invoice",
  "for N780,000, so that the N520,000 still outstanding is visible in finance and the client portal.",
].join("\n");

const LINE_ITEMS = [
  {
    description:
      "Diagnostic audit, two month foundation phase: operations and commercial diagnostic with written report, " +
      "technology and records review with prioritised roadmap, revenue baseline agreed, payer transition and " +
      "successor provider package, pharmacy and formulary audit, operations platform deployment and staff " +
      "onboarding, digital marketing and PR strategy and setup, clinical secondment induction.",
    quantity: 1,
    unitPrice: FEE,
    amount: FEE,
    category: "consulting_fee",
    sortOrder: 0,
  },
];

async function main() {
  // ---------------------------------------------------------------- client
  let client = await prisma.client.findFirst({ where: { name: CLIENT_NAME } });
  const clientData = {
    name: CLIENT_NAME,
    type: "PRIVATE_ELITE" as const,
    primaryContact: "Dr Chito Nwana",
    email: "", // not known anywhere; left blank rather than guessed
    phone: "",
    address: "Asokoro, Abuja, FCT",
    currency: "NGN" as const,
    status: "ACTIVE" as const,
    notes: CLIENT_NOTES_INTERNAL,
  };
  if (client) {
    client = await prisma.client.update({ where: { id: client.id }, data: clientData });
    console.log(`Updated client ${CLIENT_NAME} (${client.id}).`);
  } else {
    client = await prisma.client.create({ data: clientData });
    console.log(`Created client ${CLIENT_NAME} (${client.id}).`);
  }

  // ------------------------------------------------------------ engagement
  const engagementData = {
    clientId: client.id,
    name: "Arabella Women's Health Diagnostic Audit",
    description: ENGAGEMENT_DESCRIPTION,
    serviceType: "HOSPITAL_OPERATIONS" as const,
    engagementType: "PROJECT" as const,
    startDate: ON_SITE,
    endDate: PHASE_END,
    status: "ACTIVE" as const,
    budgetAmount: FEE,
    budgetCurrency: "NGN" as const,
    riskLevel: "MEDIUM" as const,
    budgetSensitivity: "PREMIUM",
    notes: ENGAGEMENT_NOTES,
  };
  const engagement = await prisma.engagement.upsert({
    where: { engagementCode: ENGAGEMENT_CODE },
    create: { engagementCode: ENGAGEMENT_CODE, ...engagementData },
    update: engagementData,
  });
  console.log(`Engagement ${ENGAGEMENT_CODE} (${engagement.id}).`);

  // --------------------------------------------------------------- invoice
  const invoiceData = {
    clientId: client.id,
    engagementId: engagement.id,
    invoiceType: "STANDARD" as const,
    subtotal: FEE,
    tax: 0,
    whtAmount: 0,
    discountAmount: 0,
    total: FEE,
    paidAmount: MOBILISATION,
    balanceDue: BALANCE,
    currency: "NGN" as const,
    status: "PARTIALLY_PAID" as const,
    issuedDate: INVOICE_ISSUED,
    dueDate: BALANCE_DUE,
    lineItems: LINE_ITEMS, // legacy JSON mirror
    bankDetails: {
      bank: "Zenith Bank",
      accountName: "Consult for Africa Management Services Limited",
      accountNumber: "1312352157",
      reference: INVOICE_NUMBER,
    },
    clientNotes: INVOICE_CLIENT_NOTES,
    notes: INVOICE_INTERNAL_NOTES,
  };
  const invoice = await prisma.invoice.upsert({
    where: { invoiceNumber: INVOICE_NUMBER },
    create: { invoiceNumber: INVOICE_NUMBER, ...invoiceData },
    update: invoiceData,
  });
  console.log(`Invoice ${INVOICE_NUMBER} (${invoice.id}).`);

  // rebuild the children beneath the invoice and the engagement
  await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.paymentMilestone.deleteMany({ where: { engagementId: engagement.id } });

  for (const li of LINE_ITEMS) {
    await prisma.invoiceLineItem.create({ data: { invoiceId: invoice.id, ...li } });
  }
  console.log(`  ${LINE_ITEMS.length} line item(s).`);

  // ---------------------------------------------------- payment milestones
  await prisma.paymentMilestone.create({
    data: {
      engagementId: engagement.id,
      invoiceId: invoice.id,
      name: "Mobilisation, 60% of fee",
      amount: MOBILISATION,
      currency: "NGN",
      dueDate: INVOICE_ISSUED,
      paidDate: MOBILISATION_PAID,
      status: "PAID",
    },
  });
  await prisma.paymentMilestone.create({
    data: {
      engagementId: engagement.id,
      invoiceId: invoice.id,
      name: "Balance, 40% of fee, month two. Trigger to be confirmed with the client",
      amount: BALANCE,
      currency: "NGN",
      dueDate: BALANCE_DUE,
      status: "PENDING",
    },
  });
  console.log("  2 payment milestones.");

  // --------------------------------------------------------------- payment
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: MOBILISATION,
      currency: "NGN",
      paymentDate: MOBILISATION_PAID,
      paymentMethod: "bank_transfer",
      status: "CONFIRMED",
      confirmedAt: MOBILISATION_PAID,
      notes:
        "Mobilisation, 60% of the N1,300,000 audit fee. Debo confirmed the alert on 28 September 2026. " +
        "Bank reference not captured at the time; add it here if it is needed for reconciliation.",
    },
  });
  console.log("  1 confirmed payment.");

  // -------------------------------------------------------------- read back
  const v = await prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: {
      client: { select: { name: true, email: true, phone: true } },
      engagement: { select: { engagementCode: true, name: true, status: true, budgetAmount: true, startDate: true, endDate: true } },
      lineItemRecords: true,
      payments: true,
      paymentMilestones: { orderBy: { dueDate: "asc" } },
    },
  });
  const n = (x: unknown) => "N" + Number(x).toLocaleString();
  console.log("\n" + "=".repeat(74));
  console.log(`  ${v?.client.name}  /  ${v?.engagement?.engagementCode}  ${v?.engagement?.status}`);
  console.log(`  ${v?.engagement?.name}`);
  console.log(`  On site ${v?.engagement?.startDate.toISOString().slice(0, 10)} to ${v?.engagement?.endDate?.toISOString().slice(0, 10)}`);
  console.log(`  Budget ${n(v?.engagement?.budgetAmount)}`);
  console.log("-".repeat(74));
  console.log(`  ${v?.invoiceNumber}  ${v?.status}   total ${n(v?.total)}  paid ${n(v?.paidAmount)}  due ${n(v?.balanceDue)}`);
  for (const m of v?.paymentMilestones ?? []) {
    console.log(`    ${m.dueDate.toISOString().slice(0, 10)}  ${n(m.amount).padStart(12)}  ${m.status.padEnd(8)} ${m.name}`);
  }
  for (const p of v?.payments ?? []) {
    console.log(`    payment  ${p.paymentDate.toISOString().slice(0, 10)}  ${n(p.amount)}  ${p.status}  ${p.paymentMethod}`);
  }
  console.log(`  Line items ${v?.lineItemRecords.length}`);
  if (!v?.client.email) console.log("  WARNING: no client email on record. Fill it in before any send or portal invite.");
  console.log("=".repeat(74));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
