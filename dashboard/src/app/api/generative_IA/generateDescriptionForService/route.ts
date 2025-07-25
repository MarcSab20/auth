import { NextResponse } from "next/server";
import { AnthropicService } from "../../../../services/anthropicService";
import { GroqService } from "../../../../services/groqService";

// Initialisation des services
const anthropicService = new AnthropicService();
const groqService = new GroqService();

export async function POST(request: Request) {
  try {
    // Extraction des données du corps de la requête
    const body = await request.json();
    console.log("Données reçues :", body);
    const {
      title,
      description,
      price,
      lowerPrice,
      upperPrice,
      supplyType,
      billingPlan,
      uptakeForm,
      hasPhysicalAddress,
      addressLine1,
      city,
      country,
      postalCode,
      serviceTags,
    } = body;

    // Validation des champs obligatoires
    if (!title || !supplyType ||  !uptakeForm) {
      return NextResponse.json(
        {
          error:
            "Les champs 'title','supplyType' et 'uptakeForm' sont obligatoires.",
        },
        { status: 400 }
      );
    }

    // Mise en forme des tags
    const formattedTags =
      serviceTags && serviceTags.length > 0
        ? serviceTags.map((tag: { name: string }) => tag.name).join(", ")
        : "Aucun tag spécifié";

    // Construction du prompt pour l'IA
    const prompt = `
Rédige une description détaillée en français au format Markdown pour un service en utilisant ces informations :
- **Titre** : ${title || "Non spécifié"}
- **Description complémentaire** : ${
      description || "Aucune information supplémentaire fournie"
    }
- **Prix** : ${
      price
        ? `${price} €`
        : "Non spécifié"
    }
- **Type de prestation** : ${supplyType}
- **Mode de facturation** : ${billingPlan}
- **Méthode de prise en charge** : ${uptakeForm}
- **Adresse physique** : ${
      hasPhysicalAddress
        ? `Oui - ${addressLine1 || ""}, ${postalCode || ""} ${city || ""}, ${
            country || ""
          }`
        : "Non"
    }
- **Tags associés** : ${formattedTags}

Consignes :
1. Structure en Markdown avec titres et sections claires.
2. Ton professionnel adapté au type de service (${supplyType}).
3. Mise en valeur des éléments clés : avantages, spécificités, modalités.
4. Intègre harmonieusement toutes les informations fournies.
5. Limite à 300 mots maximum.
`;

    const systemPrompt = "Expert en création de descriptions de services. Génère uniquement du contenu en Markdown structuré sans commentaires.";

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
    
    // Réponse JSON contenant la description générée
    return NextResponse.json(generatedText);
  } catch (error) {
    console.error("Erreur interne :", error);
    return NextResponse.json(
      {
        error:
          "Erreur serveur: " +
          (error instanceof Error ? error.message : "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}