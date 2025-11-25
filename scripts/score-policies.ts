import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error("Error: GOOGLE_API_KEY environment variable is not set.");
    console.error("Please create a .env file with GOOGLE_API_KEY=your_api_key_here");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    policy_text_snippet: {
                        type: SchemaType.STRING,
                        description: "First 20 chars of policy text for identification",
                    },
                    raw_human_rights_score: {
                        type: SchemaType.INTEGER,
                        description: "A score from 1 to 10 representing the human rights impact. 1 = Severe Harm, 10 = Substantial Improvement.",
                    },
                    weight: {
                        type: SchemaType.INTEGER,
                        description: "A weight of 1, 2, or 3 based on impact severity. 3 = Critical/Absolute Rights, 2 = Core Civil/Political Rights, 1 = Administrative/Socio-Economic.",
                    },
                    reasoning: {
                        type: SchemaType.STRING,
                        description: "Brief explanation for the score and weight.",
                    },
                },
                required: ["raw_human_rights_score", "weight", "reasoning"],
            },
        },
    },
});

const DATA_PATH = path.join(process.cwd(), "src/lib/data/policies.json");

async function scorePolicies() {
    const args = process.argv.slice(2);
    const forceRescore = args.includes('--rescore');

    console.log("Reading policies from:", DATA_PATH);
    if (forceRescore) console.log("Force rescore enabled. Reprocessing all policies.");

    const rawData = fs.readFileSync(DATA_PATH, "utf-8");
    const parties = JSON.parse(rawData);

    // Collect policies to score
    const policiesToScore = [];
    for (const party of parties) {
        for (const policy of party.policies) {
            if (forceRescore || policy.raw_human_rights_score === undefined || policy.weight === undefined) {
                policiesToScore.push({
                    party_name: party.party_name,
                    policy: policy
                });
            }
        }
    }

    if (policiesToScore.length === 0) {
        console.log("No policies needed scoring. Use --rescore to force update.");
        return;
    }

    console.log(`Found ${policiesToScore.length} policies to score.`);

    // Process in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < policiesToScore.length; i += BATCH_SIZE) {
        const batch = policiesToScore.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(policiesToScore.length / BATCH_SIZE)}...`);

        const prompt = `
            Analyze the following UK political policies regarding migration and human rights.
            
            Policies:
            ${JSON.stringify(batch.map(item => ({
            text: item.policy.policy_text,
            context: item.policy.source?.notes
        })), null, 2)}

            Determine the 'raw_human_rights_score' (1-10), 'weight' (1-3), and provide 'reasoning' for EACH policy based on the following criteria:
            
            **Score (1-10):**
            - 1-2: Severe Harm / Rights Violation (e.g., deportation to unsafe zones, detention without trial).
            - 3-4: Moderate Harm / Restriction (e.g., increased visa fees, stricter family rules).
            - 5: Neutral / No Significant Human Rights Impact.
            - 6-7: Moderate Improvement / Rights Protection.
            - 8-10: Significant Improvement / Major Rights Extension (e.g., amnesty, safe routes).

            **Weight (1-3):**
            - 3.0: Critical/Absolute Rights (Life, Torture, Slavery, Non-Refoulement, Destitution).
            - 2.0: Core Civil/Political Rights (Family Life, Liberty, Due Process).
            - 1.0: Administrative/Socio-Economic (Visa fees, economic thresholds).

            Return a JSON array of objects, one for each policy, in the same order.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const json = JSON.parse(response.text());

            // Update policies
            if (Array.isArray(json) && json.length === batch.length) {
                for (let j = 0; j < batch.length; j++) {
                    const item = batch[j];
                    const scoreData = json[j];

                    item.policy.raw_human_rights_score = scoreData.raw_human_rights_score;
                    item.policy.weight = scoreData.weight;
                    item.policy.reasoning = scoreData.reasoning;

                    console.log(`  -> Scored: ${item.policy.policy_text.substring(0, 30)}... (Score: ${scoreData.raw_human_rights_score})`);
                }
            } else {
                console.error("  -> Error: Mismatch in response length or format.");
            }

            // Rate limit protection
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`  -> Failed to score batch: ${error.message}`);
        }
    }

    console.log(`Updating policies file...`);
    fs.writeFileSync(DATA_PATH, JSON.stringify(parties, null, 2));
    console.log("Done.");
}

scorePolicies().catch(console.error);
