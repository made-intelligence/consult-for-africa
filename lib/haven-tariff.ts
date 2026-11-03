/**
 * The tariff variance, as data: the service list Ben collated (3 Nov 2026)
 * against Haven's audit tariff, Evercare Lekki's cash tariff (Oct 2026), the
 * Lagos market median (28 providers' 2026 HMO tariffs), an Abuja peer private
 * tariff (2025) and a major HMO (2025). Generated from
 * scripts/build-haven-tariff-variance.py in the main repo, which builds the PDF.
 *
 * Seen only by those who can see the financials (founders and leadership).
 */

/** name, list, tariff, Evercare, Lagos median, Abuja peer, HMO A, unit. null = no matching line. */
export type TariffLine = [string, number, number | null, number | null, number | null, number | null, number | null, string];

export const TARIFF_LINES: Record<string, TariffLine[]> = {
    "Consultations": [
        ["Registration", 10000, 10000, 12000, 11000, 10000, 5000, ""],
        ["GP consultation", 15000, 15000, null, 15000, 15000, null, ""],
        ["Paediatrician, first consultation", 35000, 35000, null, 75000, 25000, null, ""],
        ["Endocrinologist, first visit", 150000, 90000, null, 75000, 54000, 30000, ""],
        ["Endocrinologist, follow up", 130000, 80000, null, 60000, 37800, 17500, ""],
        ["Cardiologist", 80000, 90000, null, 75000, 45000, 25000, ""],
        ["Cardiologist, follow up", 70000, 80000, null, 60000, 31500, 5000, ""],
        ["Haematologist", 80000, 80000, null, 75000, 35000, 30000, ""],
        ["Haematologist, follow up", 65000, 70000, null, 60000, 24500, 20000, ""],
        ["Rheumatologist", 180000, 180000, null, 75000, 60000, 40000, ""],
        ["Rheumatologist, follow up", 130000, 130000, null, 60000, 42000, null, ""],
        ["Gastroenterologist", 80000, 80000, null, 75000, 45000, 30000, ""],
        ["Neurologist", 100000, 100000, null, 75000, 55000, 50000, ""],
        ["Neurologist, follow up", 75000, 75000, null, 60000, 38500, null, ""],
        ["Dermatologist", 70000, 70000, 50000, 75000, 40000, null, ""],
        ["Dermatologist, follow up", 70000, 60000, null, 60000, 28000, null, ""],
        ["Nephrologist, outpatient", 175000, 150000, null, 75000, 55000, 30000, ""],
        ["Nephrologist, inpatient", 100000, null, null, null, null, null, "/day"],
        ["Optometrist", 50000, 50000, null, 10000, null, null, ""],
        ["Orthopaedist", 100000, 80000, null, 75000, 35000, 20000, ""],
        ["Neonatologist", 100000, 100000, null, 75000, null, null, ""],
        ["Speech therapist, first", 150000, 150000, null, 75000, null, null, ""],
        ["Speech therapist, follow up", 60000, 60000, null, 60000, null, null, ""],
        ["Echocardiography", 120000, 120000, 90000, 88000, 81000, 45000, ""],
    ],
    "Ward and admission": [
        ["Private ward", 50000, 100000, 135000, 65000, 75000, null, "/day"],
        ["Incubator (ward)", 100000, 0, 51000, null, null, null, "/day"],
        ["Feeding", 75000, 0, null, null, 6750, 6500, "/day"],
        ["Nursing fee, admission", 30000, 30000, 30000, null, 15000, null, "/day"],
        ["Ambulatory care", 25000, 25000, 33000, null, null, null, ""],
        ["Nursing fee, ambulatory", 20000, 20000, null, null, null, null, ""],
        ["Consumables", 30000, null, null, null, null, null, "/3 days"],
    ],
    "NICU": [
        ["NICU accommodation", 300000, 300000, 168000, null, 65000, null, "/day"],
        ["NICU nursing care", 150000, 150000, null, null, 20000, null, "/day"],
        ["NICU incubator", 75000, 75000, 51000, null, null, null, "/day"],
        ["NICU CPAP", 120000, 120000, 66000, null, 175500, 90000, "/day"],
        ["NICU ventilator", 150000, 150000, 77000, null, 175500, 90000, "/day"],
        ["NICU consumables", 75000, 75000, null, null, null, null, "/3 days"],
        ["NICU resuscitaire", 75000, 75000, null, null, 87750, 45600, ""],
        ["Oxygen, concentrator", 50000, null, null, null, null, null, "/day"],
        ["Oxygen, cylinder, continuous", 100000, 100000, 60000, null, 140400, 30000, "/day"],
        ["Oxygen, cylinder, intermittent", 75000, 50000, null, null, null, null, "/day"],
        ["Nebulisation", 15000, 10000, 9000, null, 10000, 9448, "/session"],
        ["Phototherapy", 25000, 25000, 14000, null, 17550, 9000, "/day"],
    ],
    "Procedures": [
        ["Circumcision, with Plastibell", 50000, 50000, 158000, 40000, 61290, 24786, ""],
        ["Venous cut down", 100000, 0, null, null, 517320, null, ""],
        ["Ear piercing", 10000, 0, 7000, null, 10000, 6564, ""],
        ["Minor wound dressing", 10000, 5000, 14000, null, 7500, 2869, ""],
        ["Major wound dressing", 5000, 15000, 20000, null, 25000, 8606, ""],
        ["Skin prick test (allergy)", 250000, 250000, 112000, null, 155916, null, ""],
        ["Ear syringing, both ears", 30000, 15000, 44000, null, null, null, ""],
        ["Ear dressing", 20000, 0, 22000, null, 17550, 8951, "/ear"],
    ],
    "Laboratory": [
        ["Full blood count", 11500, 11500, 12000, 8442, 8784, 4524, ""],
        ["Malaria parasite", 5500, 5500, 14000, 4050, 7027, 4056, ""],
        ["Blood group", 10000, 10000, 12000, null, 5270, 2574, ""],
        ["Microscopy, culture and sensitivity", 22000, 22000, 38000, 13000, 13176, 9438, ""],
        ["H. pylori", 20000, 20000, 28000, null, 11712, 10530, ""],
        ["Electrolytes, urea and creatinine", 23000, 23000, 30000, 20766, 13176, null, ""],
        ["CRP", 14000, 14000, 19000, null, 17568, 7508, ""],
        ["Hepatitis B", 7500, 0, 11000, 6600, 7320, 5720, ""],
    ],
}


/** The fixes the list needs before it is used. Status lives in TariffFix rows, seeded from these. */
export const TARIFF_FIXES: { code: string; title: string; detail: string }[] = [
  { code: "TF-01", title: "Wound dressing prices are swapped", detail: "Major N5,000, minor N10,000 on the list. The tariff had major N15,000, minor N5,000." },
  { code: "TF-02", title: "Feeding at N75,000 a day", detail: "Seven to eleven times other providers (N6,500 to N11,000). Likely meant N7,500." },
  { code: "TF-03", title: "Ward incubator dearer than NICU incubator", detail: "N100,000 a day on the ward against N75,000 in the NICU." },
  { code: "TF-04", title: "Private ward price conflict", detail: "N50,000 on the list, N100,000 in the tariff. Name the room: two-bed or three-bed." },
  { code: "TF-05", title: "GP consultation cost typo", detail: "\"3,5471/patient\": N3,547 or N35,471." },
  { code: "TF-06", title: "One rule for specialist mark-ups", detail: "Today 20% to 100% with no rule. Set one, as the list already has for referred lab tests." },
  { code: "TF-07", title: "Lab mark-up bands overlap", detail: "N25,000 falls in both \"10,001 to 25,000\" and \"25,000 and above\"." },
  { code: "TF-08", title: "NICU day rate against Evercare", detail: "About N670,000 a day on CPAP at Haven against N285,000 at Evercare. Bring it towards Evercare, or attach the Duchess comparison." },
  { code: "TF-09", title: "Price the 1,952 zero-priced lines", detail: "Mostly drugs and lab tests, billed from memory or not at all. Drugs can be priced by rule from cost." },
];

export const NICU_DAY = { haven: 670000, evercare: 285000 };

export function allLines() {
  return Object.values(TARIFF_LINES).flat();
}

/** Who owns the fixes: leadership, and the heads of finance and of admin. */
export function ownsTariffFixes(tiers: string[], position: string) {
  return tiers.includes("LEADERSHIP") || (tiers.includes("SUPERVISOR") && /finance|admin/i.test(position));
}
