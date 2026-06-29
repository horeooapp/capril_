import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: ING-04 - Lecture des 3 axes de statut
    return NextResponse.json({ message: "Not implemented", id: params.id }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
