import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.target_type || !body?.target_id || !body?.field || body?.new_value === undefined) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth required" }, { status: 401 });

  const { error } = await db.from("contributions").insert({
    user_id: user.id,
    target_type: body.target_type,
    target_id: body.target_id,
    field: body.field,
    old_value: body.old_value ?? null,
    new_value: body.new_value,
    rationale: body.rationale ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
