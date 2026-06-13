import { NextResponse } from "next/server";
import { createReview, listReviews } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await listReviews();
  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const review = await createReview(body);
  return NextResponse.json({ review }, { status: 201 });
}
