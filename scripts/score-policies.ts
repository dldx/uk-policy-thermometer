import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { TOPIC_CONFIGS } from "../src/lib/data/scoring-criteria.js";

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error("Error: GOOGLE_API_KEY environment variable is not set.");
    console.error("Please create a .env file with GOOGLE_API_KEY=your_api_key_here");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const DATA_DIR = path.join(process.cwd(), "src/lib/data");

interface Score {
    reasoning: string;
    score: number;
    weight: number;
}

interface Policy {
    date_announced: string;
    policy_text: string;
    scores: {
        [criterion: string]: Score;
    };
    source?: {
        url?: string;
        notes?: string;
    };
}

interface Party {
    party_name: string;
    color: string;
    policies: Policy[];
}

async function scorePolicies() {
    const args = process.argv.slice(2);

    // Parse arguments
    const topicArg = args.find((arg) => arg.startsWith("--topic="));
    const criteriaArg = args.find((arg) => arg.startsWith("--criteria="));
    const forceRescore = args.includes("--rescore");

    if (!topicArg) {
        console.error("Error: --topic argument is required");
        console.error("Usage: bun run scripts/score-policies.ts --topic=<topic> --criteria=<criterion1,criterion2> [--rescore]");
        console.error("Available topics:", Object.keys(TOPIC_CONFIGS).join(", "));
        process.exit(1);
    }

    const topic = topicArg.split("=")[1] as keyof typeof TOPIC_CONFIGS;
    if (!TOPIC_CONFIGS[topic]) {
        console.error(`Error: Unknown topic "${topic}"`);
        console.error("Available topics:", Object.keys(TOPIC_CONFIGS).join(", "));
        process.exit(1);
    }

    const config = TOPIC_CONFIGS[topic];
    const criteriaToScore = criteriaArg
        ? criteriaArg.split("=")[1].split(",")
        : config.criteria;

    // Validate criteria
    for (const criterion of criteriaToScore) {
        if (!config.criteria.includes(criterion)) {
            console.error(`Error: Invalid criterion "${criterion}" for topic "${topic}"`);
            console.error(`Available criteria for ${topic}:`, config.criteria.join(", "));
            process.exit(1);
        }
    }

    const dataPath = path.join(DATA_DIR, config.file);
    console.log(`\nScoring ${topic} policies`);
    console.log(`File: ${dataPath}`);
    console.log(`Criteria: ${criteriaToScore.join(", ")}`);
    if (forceRescore) console.log("Force rescore enabled\n");

    // Read data
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const parties: Party[] = JSON.parse(rawData);

    // Collect policies to score
    const policiesToScore: { party_name: string; policy: Policy; criteria: string[] }[] = [];
    for (const party of parties) {
        for (const policy of party.policies) {
            const missingCriteria = criteriaToScore.filter(
                (c) => forceRescore || !policy.scores || !policy.scores[c]
            );
            if (missingCriteria.length > 0) {
                policiesToScore.push({
                    party_name: party.party_name,
                    policy: policy,
                    criteria: missingCriteria,
                });
            }
        }
    }

    if (policiesToScore.length === 0) {
        console.log("No policies need scoring. Use --rescore to force update.");
        return;
    }

    console.log(`Found ${policiesToScore.length} policies to score.\n`);

    // Create model with dynamic schema for multiple criteria
    const createSchema = (criteria: string[]) => ({
        type: SchemaType.ARRAY as const,
        items: {
            type: SchemaType.OBJECT as const,
            properties: {
                policy_text_snippet: {
                    type: SchemaType.STRING as const,
                    description: "First 20 chars of policy text for identification",
                },
                scores: {
                    type: SchemaType.OBJECT as const,
                    properties: Object.fromEntries(
                        criteria.map((c) => [
                            c,
                            {
                                type: SchemaType.OBJECT as const,
                                properties: {
                                    reasoning: {
                                        type: SchemaType.STRING as const,
                                        description: "Brief explanation",
                                    },
                                    score: {
                                        type: SchemaType.INTEGER as const,
                                        description: "Score from 1 to 10",
                                    },
                                    weight: {
                                        type: SchemaType.INTEGER as const,
                                        description: "Weight from 1 to 3",
                                    },
                                },
                                required: ["reasoning", "score", "weight"],
                            },
                        ])
                    ),
                    required: criteria,
                },
            },
            required: ["scores"],
        },
    });

    // Process in batches
    const BATCH_SIZE = 10;
    for (let i = 0; i < policiesToScore.length; i += BATCH_SIZE) {
        const batch = policiesToScore.slice(i, i + BATCH_SIZE);
        console.log(
            `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(policiesToScore.length / BATCH_SIZE)}...`
        );

        // Get all unique criteria in this batch
        const batchCriteria = Array.from(
            new Set(batch.flatMap((item) => item.criteria))
        );

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: createSchema(batchCriteria),
            },
        });

        // Build prompt with all criteria
        const criteriaPrompts = batchCriteria
            .map((c) => `### ${c.replace("_", " ").toUpperCase()}\n${config.prompts[c as keyof typeof config.prompts]}`)
            .join("\n\n");

        const prompt = `
Analyze the following UK political policies regarding ${topic}.

Policies:
${JSON.stringify(
            batch.map((item) => ({
                text: item.policy.policy_text,
                context: item.policy.source?.notes,
            })),
            null,
            2
        )}

For EACH policy, provide scores for the following criteria:
${criteriaPrompts}

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

                    // Initialize scores object if it doesn't exist
                    if (!item.policy.scores) {
                        item.policy.scores = {};
                    }

                    // Update scores for each criterion
                    for (const criterion of batchCriteria) {
                        if (scoreData.scores[criterion]) {
                            item.policy.scores[criterion] = scoreData.scores[criterion];
                        }
                    }

                    console.log(
                        `  -> Scored: ${item.policy.policy_text.substring(0, 30)}... (${batchCriteria.map((c) => `${c}: ${item.policy.scores[c]?.score || "N/A"}`).join(", ")})`
                    );
                }

                // Save after each successful batch
                console.log(`  -> Saving progress...`);
                fs.writeFileSync(dataPath, JSON.stringify(parties, null, 2));
            } else {
                console.error("  -> Error: Mismatch in response length or format.");
            }

            // Rate limit protection
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error: any) {
            console.error(`  -> Failed to score batch: ${error.message}`);
        }
    }

    console.log(`\nAll batches completed. Final save to ${config.file}...`);
    fs.writeFileSync(dataPath, JSON.stringify(parties, null, 2));
    console.log("Done.\n");
}

scorePolicies().catch(console.error);

