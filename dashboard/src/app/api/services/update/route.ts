import { NextResponse } from 'next/server';
import { smpClient } from '@/smpClient';

export async function POST(request: Request) {
  try {
    const { serviceID, updates } = await request.json();
    const updated = await smpClient.service.updateService(serviceID, updates);
    if (!updated) return NextResponse.error();
    return NextResponse.json({ message: "Service mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur dans service/update:", error);
    return NextResponse.error();
  }
}
