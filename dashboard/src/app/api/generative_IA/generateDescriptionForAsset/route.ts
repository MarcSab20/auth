// /app/api/generative_IA/generateShortDescriptionForAsset/route.ts
import { NextResponse } from "next/server";
import { AnthropicService } from "../../../../services/anthropicService";
import { GroqService } from "../../../../services/groqService";

// Initialisation des services
const anthropicService = new AnthropicService();
const groqService = new GroqService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, price, quantity, description } = body;

    // Validation du champ titre
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: "Le champ 'title' est obligatoire pour générer la description." },
        { status: 400 }
      );
    }

    // Construction du prompt pour une description détaillée
    const prompt = `
Rédige une description détaillée en français au format Markdown pour l'asset suivant :

- **Titre** : ${title.trim()}
- **Prix** : ${price ? `${price} €` : "Non spécifié"}
- **Quantité** : ${quantity || "Non spécifiée"}
- **Description existante** : ${description || "Aucune description existante"}

Consignes :
1. Structure en Markdown avec titres et sections claires
2. Mise en valeur des éléments clés : caractéristiques, avantages, spécificités
3. Intègre harmonieusement toutes les informations fournies
4. Limite à 300 mots maximum
`;

    const systemPrompt = "Expert en rédaction de descriptions d'assets. Génère uniquement du contenu en Markdown structuré sans commentaires.";

    let generatedText = "";

    try {
      // Essai d'abord avec Anthropic
      generatedText = await anthropicService.generateContent(
        prompt,
        systemPrompt,
        1000,
        0.3
      );
    } catch (anthropicError) {
      console.error("Erreur Anthropic, tentative avec Groq:", anthropicError);
      
      try {
        // Fallback sur Groq si Anthropic échoue
        generatedText = await groqService.generateContent(
          prompt,
          systemPrompt,
          1000,
          0.3
        );
      } catch (groqError) {
        console.error("Erreur Groq:", groqError);
        throw new Error("Les deux services de génération ont échoué");
      }
    }

    return NextResponse.json(generatedText.trim());
  } catch (error) {
    console.error("Erreur génération description asset :", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne lors de la génération." },
      { status: 500 }
    );
  }
}
