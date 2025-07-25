import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      organizationID,
      estimateId,
      contractType,
      startDate,
      duration,
      renewable,
      renewDuration,
      renewNotice,
      jurisdiction
    } = data;

    // Pour le moment, on génère un ID simple
    // Dans une vraie application, cela viendrait de la base de données
    const contractId = `contract_${Date.now()}`;

    // Simuler la création du contrat
    // TODO: Implémenter la logique de création en base de données
    
    return NextResponse.json({
      contractId,
      organizationID,
      estimateId,
      contractType,
      startDate,
      duration,
      renewable,
      renewDuration,
      renewNotice,
      jurisdiction,
      status: 'draft',
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 