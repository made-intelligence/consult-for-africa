import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signCadreEmployerJWT } from "@/lib/cadreEmployerAuth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { handler } from "@/lib/api-handler";

function verifyPasswordPbkdf2(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
    return bcrypt.compare(password, stored);
  }
  return verifyPasswordPbkdf2(password, stored);
}

export const POST = handler(async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const employer = await prisma.cadreEmployerAccount.findUnique({
      where: { contactEmail: email.toLowerCase().trim() },
      include: { org: { select: { id: true, name: true, facilityId: true, isVerified: true } } },
    });

    if (!employer || !(await verifyPassword(password, employer.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Stamped so an admin can tell an account that was invited and never used
    // from one that is in daily service.
    await prisma.cadreEmployerAccount.update({
      where: { id: employer.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signCadreEmployerJWT({
      sub: employer.id,
      email: employer.contactEmail,
      companyName: employer.org.name,
      contactName: employer.contactName,
      isVerified: employer.org.isVerified,
      facilityId: employer.org.facilityId,
    });

    const cookieStore = await cookies();
    cookieStore.set("cadre_employer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({
      id: employer.id,
      companyName: employer.org.name,
    });
  } catch (error) {
    console.error("Employer login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
});
