// app/api/services/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { smpClient, initializeSMPClient } from '@/smpClient';

export async function POST(req: NextRequest) {
  try {
    await initializeSMPClient();

    const { input } = await req.json();
    console.log("Input de recherche:", input);

    if (!input?.searchTerm || typeof input.searchTerm !== 'string') {
      return NextResponse.json({ error: 'searchTerm manquant ou invalide' }, { status: 400 });
    }

    const services = await smpClient.service.search(input);

    return NextResponse.json(services);
  } catch (error) {
    console.error("Erreur dans la recherche des services:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
