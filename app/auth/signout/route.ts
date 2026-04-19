import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

export async function POST(req: Request) {
  const db = await getServerDb();
  await db.auth.signOut();
  return NextResponse.redirect(new URL("/", new URL(req.url).origin));
}
