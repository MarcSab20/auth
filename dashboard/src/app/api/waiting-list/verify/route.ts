import { NextResponse } from "next/server";
import { smpClient } from "@/smpClient";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token manquant" },
        { status: 400 }
      );
    }

    const response = await smpClient.waitingList.verifyToken(token);

    // La réponse est directement les données du token
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error verifying token:", error);
    
    // Si c'est une erreur GraphQL, on la renvoie telle quelle
    if (error.response?.errors) {
      return NextResponse.json(
        { response: error.response },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification du token" },
      { status: 500 }
    );
  }
} 