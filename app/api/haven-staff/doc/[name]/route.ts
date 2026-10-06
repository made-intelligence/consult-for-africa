import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getStaffSession } from "@/lib/staffAuth";

// The staff documents, behind the session.
//
// They used to sit in public/, which meant a 200 to anybody who had or guessed
// the URL. The content is staff-safe, so nothing leaked that matters, but the
// tier model said ALL_STAFF and the filesystem said everyone, and the next file
// put there will not be harmless.

export const dynamic = "force-dynamic";

// An allowlist, not a path join on user input. A name parameter that reaches
// the filesystem is how a document route becomes an arbitrary file read.
const DOCS: Record<string, { file: string; download: string }> = {
  "staff-pack": { file: "staff-pack.pdf", download: "Welcome-to-Haven-Again.pdf" },
  "town-hall": { file: "town-hall.pdf", download: "Haven-Town-Hall.pdf" },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.redirect(new URL("/HavenStaff/login", req.url));
  }

  const { name } = await params;
  const doc = DOCS[name];
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buf = await fs.readFile(path.join(process.cwd(), "private-assets", "haven", doc.file));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        // inline so it opens in the phone's viewer rather than landing in
        // Downloads, which is where documents go to be forgotten.
        "Content-Disposition": `inline; filename="${doc.download}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
}
