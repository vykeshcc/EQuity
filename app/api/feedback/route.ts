import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.target_type || !body?.target_id || ![1, -1].includes(body.rating)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  const { error } = await db.from("feedback").insert({
    target_type: body.target_type,
    target_id: body.target_id,
    rating: body.rating,
    comment: body.comment ?? null,
    user_id: user?.id ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
