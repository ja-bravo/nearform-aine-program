import { NextResponse } from "next/server";

/** Container-friendly liveness: no upstream dependencies. */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
