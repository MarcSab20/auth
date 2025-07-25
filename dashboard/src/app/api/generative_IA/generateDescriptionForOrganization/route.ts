import { NextResponse } from "next/server";
import { AnthropicService } from "../../../../services/anthropicService";
import { GroqService } from "../../../../services/groqService";

// Initialisation des services
const anthropicService = new AnthropicService();
const groqService = new GroqService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand, juridicForm, capital, country, sectorID, city, description } = body;

    if (!brand || !country || !sectorID) {
      return NextResponse.json(
        {
          error:
            "Les champs 'brand', 'juridicForm', 'country', et 'sectorID' sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const sectorDescriptions: { [key: string]: string } = {
      "1": "Éducation",
      "2": "Restauration",
      "3": "Informatique, développement informatique, technologie",
      "4": "Santé, bien-être",
      "5": "Service à la personne (inclut les prestations de ménage, garde d'enfants, plomberie, etc.)",
    };

    const sectorName = sectorDescriptions[sectorID] || "Autre secteur";

    const prompt = `
Rédige une description détaillée en français au format Markdown pour une organisation en utilisant ces informations :
- **Marque** : ${brand || "Non spécifié"}
- **Forme juridique** : ${juridicForm || "Non spécifié"}
- **Capital** : ${capital ? `${capital} €` : "Non spécifié"}
- **Pays** : ${country}
- **Ville** : ${city || "Non spécifiée"}
- **Secteur d'activité** : ${sectorName}
- **Description complémentaire** : ${description || "Aucune information supplémentaire fournie"}
Consignes :
1. Structure en Markdown avec titres et sections claires
2. Ton professionnel adapté au secteur (${sectorName})
3. Mise en valeur des éléments clés : valeurs, spécificités, avantages
4. Intègre harmonieusement toutes les informations fournies
5. Limite à 300 mots maximum`;

    const systemPrompt = "Expert en création de descriptions d'entreprise. Génère uniquement du contenu en Markdown structuré sans commentaires.";

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

    return NextResponse.json({
      description: generatedText,
      promptUsed: prompt,
    });
  } catch (error) {
    console.error("Erreur interne :", error);
    return NextResponse.json(
      {
        error: "Erreur serveur: " + (error instanceof Error ? error.message : "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}