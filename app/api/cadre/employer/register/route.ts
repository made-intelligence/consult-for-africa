import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signCadreEmployerJWT } from "@/lib/cadreEmployerAuth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { handler } from "@/lib/api-handler";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export const POST = handler(async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, contactName, contactEmail, contactPhone, password, facilityId } = body;

    if (!companyName || !contactName || !contactEmail || !password) {
      return NextResponse.json(
        { error: "Company name, contact name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check existing email
    const existing = await prisma.cadreEmployerAccount.findUnique({
      where: { contactEmail: contactEmail.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. If you do not remember your password, contact support to reset it.", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    // Optionally verify facility exists. A facility already claimed by another
    // org is left unlinked rather than stolen: two hospitals with similar names
    // picking the same directory entry should not merge into one tenancy.
    let validFacilityId: string | null = null;
    if (facilityId) {
      const facility = await prisma.cadreFacility.findUnique({
        where: { id: facilityId },
        select: { id: true, employerOrg: { select: { id: true } } },
      });
      if (facility && !facility.employerOrg) validFacilityId = facility.id;
    }

    // Registering creates the organisation and makes this person its owner. The
    // org is the tenancy boundary, so roles and shortlists survive the departure
    // of whoever happened to sign up.
    const employer = await prisma.cadreEmployerAccount.create({
      data: {
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.toLowerCase().trim(),
        contactPhone: contactPhone?.trim() || null,
        passwordHash: await hashPassword(password),
        role: "OWNER",
        acceptedAt: new Date(),
        org: {
          create: {
            name: companyName.trim(),
            facilityId: validFacilityId,
          },
        },
      },
      include: { org: { select: { id: true, facilityId: true } } },
    });

    // Account is now created. If anything below fails (JWT signing, cookie set),
    // we still return a useful response so the user can log in rather than see
    // a generic "registration failed" message that masks a successful create.
    try {
      const token = signCadreEmployerJWT({
        sub: employer.id,
        email: employer.contactEmail,
        companyName: employer.companyName,
        contactName: employer.contactName,
        isVerified: employer.isVerified,
        facilityId: employer.org.facilityId,
      });

      const cookieStore = await cookies();
      cookieStore.set("cadre_employer_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      return NextResponse.json({ id: employer.id });
    } catch (sessionErr) {
      console.error("Employer registration session error (account was created):", sessionErr);
      return NextResponse.json(
        {
          id: employer.id,
          requiresLogin: true,
          message: "Account created. Please log in to continue.",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Employer registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
});
