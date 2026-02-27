import { NextRequest, NextResponse } from "next/server";
import type { Hospital, ApiResponse } from "@/types";
import hospitalsData from "@/data/hospitals.json";

export const dynamic = "force-dynamic";

const hospitals = hospitalsData as Hospital[];

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const query = searchParams.get("q");

    let filtered = [...hospitals];

    if (city) {
      filtered = filtered.filter((h) =>
        h.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.district.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q)
      );
    }

    const response: ApiResponse<Hospital[]> = {
      data: filtered,
      total: filtered.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[API /hospitals] Error:", error);
    return NextResponse.json(
      { error: "伺服器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
};
