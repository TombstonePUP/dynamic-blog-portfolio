import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, title: "First Post" },
  ]);
}

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    message: "Post created",
    data: body,
  });
}