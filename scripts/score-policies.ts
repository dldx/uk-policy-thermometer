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

// Topic configurations
const TOPIC_CONFIGS = {
    migration: {
        file: "policies-migration.json",
        criteria: ["human_rights", "economic_impact"],
        prompts: {
            human_rights: `
**FRAMEWORK:** Score based on compliance with international human rights law, including:
- European Convention on Human Rights (ECHR): Articles 2 (Life), 3 (Torture), 5 (Liberty), 6 (Fair Trial), 8 (Family Life), 13 (Effective Remedy)
- 1951 Refugee Convention: Non-refoulement (Article 33), access to asylum procedures
- International Covenant on Civil and Political Rights (ICCPR)
- UN Convention on the Rights of the Child (CRC)

**Score (1-10):** Rate the policy's impact on human rights compliance:

**1-2: Severe Violation** - Policy directly contravenes absolute rights or creates high risk of serious harm
- Examples: Deportation to countries with torture risk, indefinite detention without review, removal of non-refoulement protections
- Legal standard: Violates ECHR Articles 2-3, Refugee Convention Article 33

**3-4: Moderate Harm** - Policy restricts qualified rights without adequate justification or undermines procedural safeguards
- Examples: Fast-track appeals limiting access to justice, family separation without proportionality assessment, barriers to legal representation
- Legal standard: Fails proportionality test under ECHR Article 8, undermines Article 6 fair trial rights

**5: Neutral** - Policy has NO direct human rights dimension OR impacts are purely administrative/economic without affecting rights enjoyment
- Examples: Changes to visa application forms, administrative fee adjustments that don't create barriers, neutral procedural updates
- Key test: Would this policy be challenged under human rights law? If no, score 5.

**6-7: Moderate Improvement** - Policy enhances rights protection or removes existing barriers
- Examples: Improved access to legal aid, faster processing reducing limbo, protection from exploitation, evidence-based policymaking
- Legal standard: Better aligns with ECHR Article 6, 8, or 13; improves procedural fairness

**8-10: Significant Improvement** - Policy substantially advances human rights or prevents serious violations
- Examples: Creating safe legal routes (preventing dangerous journeys), cancelling policies with refoulement risk, granting protection status, amnesty programs
- Legal standard: Directly upholds ECHR Articles 2-3, Refugee Convention obligations, or extends rights significantly

**Weight (1-3):** Based on the CATEGORY of right affected (not severity of impact):

**3: Absolute/Non-Derogable Rights** - Rights that can never be restricted, even in emergencies
- Right to Life (ECHR Art. 2), Freedom from Torture/Inhuman Treatment (Art. 3), Freedom from Slavery (Art. 4)
- Non-refoulement (Refugee Convention Art. 33)
- Protection from destitution (threshold of Art. 3)

**2: Qualified Rights & Core Procedural Guarantees** - Rights that can be restricted but only when necessary and proportionate
- Right to Family Life (ECHR Art. 8), Liberty and Security (Art. 5), Fair Trial/Due Process (Art. 6)
- Access to effective remedies (Art. 13)
- Rights of the child (CRC)

**1: Administrative/Economic Measures** - Policies primarily concerning administrative efficiency or economic migration management
- Visa fees, salary thresholds, skills requirements, processing timelines
- Only score weight=1 if the policy has NO significant impact on categories 2 or 3

**GUIDANCE FOR MIXED-IMPACT POLICIES:**
When a policy has both positive and negative human rights effects:
1. Identify the PRIMARY impact on rights enjoyment
2. Consider whether negative aspects are proportionate and necessary (ECHR test)
3. Score based on the NET effect, weighted toward protection of absolute rights
4. Example: "Targeting smugglers (positive) using counter-terrorism powers (concerning due process)" = Score 3-4 if powers lack safeguards, 6-7 if properly constrained

**ENFORCEMENT POLICIES - SPECIAL GUIDANCE:**
Legitimate enforcement (removing those with no legal right) can be compatible with human rights IF:
- Individual assessment is maintained (not blanket/automatic)
- Access to appeal and legal advice is preserved
- Non-refoulement is guaranteed (safety assessment)
- Proportionality is considered (e.g., family ties, length of residence)

Score enforcement policies:
- 6-7: If safeguards are explicit and robust
- 5: If standard procedural protections are maintained
- 3-4: If "fast-track" or "streamlined" language suggests reduced safeguards
- 1-2: If policy removes key protections or creates refoulement risk
            `,
            economic_impact: `
**FRAMEWORK:** Score based on evidence-based economic analysis, considering:
- **Labor Market Effects**: Employment levels, wages, skills matching, productivity
- **Fiscal Impact**: Tax revenue, public spending, cost-benefit to taxpayers
- **Sectoral Impact**: Effects on specific industries (healthcare, agriculture, tech, hospitality)
- **Regional Economics**: Geographic distribution of economic effects
- **Innovation & Growth**: Long-term productivity, entrepreneurship, knowledge transfer

**Score (1-10):** Rate the policy's net economic impact:

**1-2: Severe Negative Impact** - Policy causes major economic disruption or significant job losses
- Examples: Sudden removal of essential workers causing service collapse, policies triggering major labor shortages in critical sectors
- Evidence: Projected GDP decline >0.5%, mass business closures, critical service disruption

**3-4: Moderate Negative Impact** - Policy reduces economic efficiency or increases costs without offsetting benefits
- Examples: Restrictions reducing labor supply in shortage occupations, increased administrative costs without productivity gains, barriers to skills transfer
- Evidence: Increased costs to businesses/consumers, reduced labor market flexibility, lower productivity

**5: Neutral** - Policy has NO significant net economic impact OR positive and negative effects cancel out
- Examples: Administrative changes with minimal cost, policies affecting very small numbers, revenue-neutral fee adjustments
- Key test: Would economists expect measurable GDP, employment, or productivity effects? If no, score 5.

**6-7: Moderate Positive Impact** - Policy improves economic efficiency or addresses market failures
- Examples: Better skills matching, reduced exploitation improving productivity, evidence-based migration aligned with labor needs, cost savings from administrative efficiency
- Evidence: Improved labor market outcomes, fiscal savings, better resource allocation

**8-10: Significant Positive Impact** - Policy generates substantial economic growth or innovation
- Examples: Attracting high-skilled talent driving innovation, filling critical labor shortages enabling growth, major fiscal savings enabling productive investment
- Evidence: Measurable GDP growth, significant job creation, innovation metrics, major fiscal improvement

**Weight (1-3):** Based on the SCALE and CRITICALITY of economic impact:

**3: Major/National-Level Impact** - Affects entire sectors or has macroeconomic significance
- Policies affecting NHS staffing, national infrastructure, multiple industries
- Fiscal impacts >£1 billion annually
- Effects on critical national services or economic competitiveness

**2: Significant Sectoral/Regional Impact** - Substantial effects on specific industries or regions
- Policies affecting specific sectors (e.g., agriculture, social care, tech)
- Regional labor market effects
- Fiscal impacts £100m-£1bn annually

**1: Minor/Localized Impact** - Limited economic effects
- Small-scale administrative changes
- Policies affecting small numbers of workers/businesses
- Minimal fiscal impact (<£100m annually)

**GUIDANCE FOR MIXED-IMPACT POLICIES:**
When a policy has both positive and negative economic effects:
1. **Identify time horizons**: Short-term costs vs. long-term benefits (or vice versa)
2. **Assess distribution**: Who benefits and who bears costs?
3. **Consider net effect**: Do benefits outweigh costs from a whole-economy perspective?
4. **Weight toward long-term**: Favor sustainable economic outcomes over short-term gains
5. Example: "Reducing low-wage migration (negative labor supply) while investing in domestic training (positive skills)" = Score based on net long-term productivity effect

**SPECIAL CONSIDERATIONS:**

**Labor Market Policies:**
- Filling genuine shortages = Positive (6-8)
- Displacing domestic workers without skills mismatch = Negative (3-4)
- Evidence-based skills alignment = Positive (6-7)
- Arbitrary restrictions ignoring labor market data = Negative (3-4)

**Fiscal Policies:**
- Cost savings enabling productive investment = Positive (6-8)
- Short-term savings creating long-term costs = Neutral to Negative (4-5)
- Revenue generation without economic distortion = Positive (6-7)
- Costs without offsetting benefits = Negative (3-4)

**Administrative Efficiency:**
- Streamlining reducing costs and delays = Positive (6-7)
- "Efficiency" that shifts costs to applicants/businesses = Neutral (5) or Negative (4)
- Digitization with genuine productivity gains = Positive (6-7)
            `,
        },
    },
    environmental: {
        file: "policies-environmental.json",
        criteria: ["climate_impact", "biodiversity"],
        prompts: {
            climate_impact: `
**Score (1-10):**
- 1-2: Severe Harm (e.g., major increase in emissions, blocking climate action).
- 3-4: Moderate Harm (e.g., weakening environmental standards).
- 5: Neutral / No Significant Climate Impact.
- 6-7: Moderate Improvement (e.g., emissions reduction measures).
- 8-10: Significant Improvement (e.g., transformative climate action, net zero commitments).

**Weight (1-3):**
- 3: Critical impact on climate goals (e.g., major infrastructure, energy policy).
- 2: Significant sectoral impact (e.g., transport, agriculture).
- 1: Minor or indirect climate effects.
            `,
            biodiversity: `
**Score (1-10):**
- 1-2: Severe Harm (e.g., habitat destruction, species extinction risk).
- 3-4: Moderate Harm (e.g., weakening protections, increased pollution).
- 5: Neutral / No Significant Biodiversity Impact.
- 6-7: Moderate Improvement (e.g., habitat protection, pollution reduction).
- 8-10: Significant Improvement (e.g., ecosystem restoration, major conservation efforts).

**Weight (1-3):**
- 3: Critical impact on ecosystems or endangered species.
- 2: Significant impact on habitats or wildlife populations.
- 1: Minor or localized biodiversity effects.
            `,
        },
    },
    economic: {
        file: "policies-economic.json",
        criteria: ["inequality", "economic_democracy"],
        prompts: {
            inequality: `
**Score (1-10):**
- 1-2: Severe Increase in Inequality (e.g., regressive taxation, cuts to social safety net).
- 3-4: Moderate Increase in Inequality (e.g., policies favoring wealthy).
- 5: Neutral / No Significant Impact on Inequality.
- 6-7: Moderate Reduction in Inequality (e.g., progressive taxation, welfare expansion).
- 8-10: Significant Reduction in Inequality (e.g., wealth redistribution, universal basic services).

**Weight (1-3):**
- 3: Major impact on wealth/income distribution affecting millions.
- 2: Significant impact on specific groups or regions.
- 1: Minor or indirect inequality effects.
            `,
            economic_democracy: `
**Score (1-10):**
- 1-2: Severe Harm (e.g., privatization of public services, reduced worker rights).
- 3-4: Moderate Harm (e.g., weakening of democratic economic controls).
- 5: Neutral / No Significant Impact on Economic Democracy.
- 6-7: Moderate Improvement (e.g., worker representation, cooperative support).
- 8-10: Significant Improvement (e.g., public ownership expansion, worker control, democratic planning).

**Weight (1-3):**
- 3: Major shift in ownership or control of key economic sectors.
- 2: Significant changes to worker rights or democratic participation.
- 1: Minor or localized effects on economic democracy.
            `,
        },
    },
};

const DATA_DIR = path.join(process.cwd(), "src/lib/data");

interface Score {
    score: number;
    weight: number;
    reasoning: string;
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
                                    score: {
                                        type: SchemaType.INTEGER as const,
                                        description: "Score from 1 to 10",
                                    },
                                    weight: {
                                        type: SchemaType.INTEGER as const,
                                        description: "Weight from 1 to 3",
                                    },
                                    reasoning: {
                                        type: SchemaType.STRING as const,
                                        description: "Brief explanation",
                                    },
                                },
                                required: ["score", "weight", "reasoning"],
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
            model: "gemini-2.0-flash-exp",
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
            } else {
                console.error("  -> Error: Mismatch in response length or format.");
            }

            // Rate limit protection
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error: any) {
            console.error(`  -> Failed to score batch: ${error.message}`);
        }
    }

    console.log(`\nUpdating ${config.file}...`);
    fs.writeFileSync(dataPath, JSON.stringify(parties, null, 2));
    console.log("Done.\n");
}

scorePolicies().catch(console.error);

