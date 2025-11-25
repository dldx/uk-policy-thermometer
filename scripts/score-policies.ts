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
    housing: {
        file: "policies-housing.json",
        criteria: ["price_impact", "renters_rights"],
        prompts: {
            price_impact: `
**FRAMEWORK:** Score based on the policy's likely impact on house prices and rents, considering:
- **Supply-Side Effects**: Impact on housing supply (new construction, conversions, densification)
- **Demand-Side Effects**: Impact on buyer/renter demand, purchasing power, competition
- **Market Mechanisms**: Effects on transaction costs, liquidity, speculation, investment dynamics
- **Geographic Distribution**: National vs. regional effects, urban vs. rural impacts
- **Time Horizons**: Short-term vs. long-term price effects

**Score (1-10):** Rate the policy's net impact on housing affordability (via prices and rents):

**1-2: Severe Price Increase** - Policy significantly raises house prices and/or rents
- Examples: Major restrictions on supply (strict green belt protections blocking development), demand subsidies without supply increases (Help to Buy without building targets), policies encouraging speculative investment
- Evidence: Reduced housing supply, increased competition for limited stock, subsidies capitalized into prices
- Economic mechanism: Demand increase or supply decrease causing significant market imbalance

**3-4: Moderate Price Increase** - Policy likely to raise prices but with some offsetting factors
- Examples: Modest demand subsidies (smaller-scale Help to Buy), stamp duty cuts without supply response, regulations that increase building costs modestly, policies favoring owner-occupation over rental supply
- Evidence: Net reduction in effective supply, increased purchasing power capitalized into prices, higher construction costs
- Economic mechanism: Demand slightly outpacing supply, or marginal cost increases

**5: Neutral** - Policy has NO significant net impact on prices OR positive and negative effects cancel out
- Examples: Administrative changes with no market impact, revenue-neutral tax adjustments, policies affecting very small segments, regulatory changes that don't affect supply or demand meaningfully
- Key test: Would housing economists expect measurable price effects? If no, score 5.
- Also use for policies with genuinely balanced effects (e.g., demand increase matched by supply increase)

**6-7: Moderate Price Decrease** - Policy likely to lower prices through supply increases or demand reduction
- Examples: Modest increases in housing supply (brownfield development, planning reform in specific areas), policies removing transaction costs, measures deterring speculation, affordability requirements that increase net supply
- Evidence: Increased construction, reduced transaction costs enabling market liquidity, decreased speculative demand
- Economic mechanism: Supply increase outpacing demand, or reduced competition from investors/speculators

**8-10: Significant Price Decrease** - Policy substantially lowers house prices and/or rents
- Examples: Major planning reform enabling large-scale development, land value tax shifting incentives toward development, large social housing programs reducing market demand, policies strongly deterring speculative investment, significant reductions in building regulations without safety compromise
- Evidence: Large supply increases, fundamental market restructuring, major shifts in land use incentives
- Economic mechanism: Transformative supply response, demand shift from ownership to social housing, or elimination of speculative premium

**Weight (1-3):** Based on the SCALE and CERTAINTY of price impact:

**3: Major/National Impact with High Certainty** - Clear, evidence-based effects on national housing market
- Policies affecting overall housing supply significantly (major planning reform, national housebuilding programs)
- Demand-side policies affecting millions of households (national subsidies, major tax changes)
- Policies with strong economic consensus on direction and magnitude of effect
- Estimated impact on national house prices >5% or affecting >500,000 homes

**2: Significant Sectoral/Regional Impact or Moderate National Impact** - Substantial effects on specific markets or moderate national effects
- Regional planning changes, city-specific policies (London Plan rewrite)
- Policies affecting specific segments (first-time buyers, social housing, rental sector)
- Estimated impact 2-5% on national prices or >100,000 homes in specific regions
- Evidence-based but with some uncertainty about magnitude

**1: Minor/Localized Impact or High Uncertainty** - Limited market effects or unclear direction
- Small-scale programs, localized policies, pilot schemes
- Policies with ambiguous effects (e.g., demand subsidy with unclear supply response)
- Administrative changes with minimal market impact
- Estimated impact <2% or affecting <100,000 homes

**GUIDANCE FOR COMPLEX HOUSING POLICIES:**

**Supply-Side Policies:**
- **Planning Reform** (liberalization): Generally reduces prices (7-9) by increasing supply; weight depends on scope (national reform = 3, local = 2)
- **Affordable Housing Requirements**: Score depends on net effect - if requirements block development, may increase market prices (3-4, weight 2); if they enable development and increase total supply, may be neutral or positive (5-6, weight 2)
- **Building Regulations**: Safety regulations may increase costs modestly (4-5, weight 1); excessive regulations reducing supply significantly (2-3, weight 2)

**Demand-Side Policies:**
- **Buyer Subsidies (Help to Buy, First-Time Buyer schemes)**: Generally increase prices (3-4, weight 2-3) by increasing demand without guaranteed supply response - evidence shows subsidies largely capitalized into prices
- **Stamp Duty Cuts**: Modest price increases (4-5, weight 2) - reduces transaction costs but may increase competition and be capitalized into prices
- **Tax Incentives for Investors**: Typically increase prices (2-4, weight 2-3) by increasing speculative demand without adding to occupied stock

**Tenure-Specific Policies:**
- **Social Housing Construction**: Reduces market prices (7-9, weight 3) by reducing market demand and increasing overall supply
- **Rental Market Policies**: Depends on net effect on supply - rent controls reducing supply (2-3, weight 2); tenant protections without supply reduction (5-6, weight 1)
- **Leasehold Reform**: Minor impact on prices (5-6, weight 1) unless it unlocks significant supply

**Geographic and Time Considerations:**
- Distinguish between short-term price spikes (demand subsidies) and long-term affordability (supply increases)
- Consider regional variation - policies may reduce London prices (high weight) while having minimal impact elsewhere
- Favor long-term affordability over short-term price stability

**Evidence-Based Reasoning:**
Reference economic research on housing supply elasticity, price-to-income ratios, historical policy effects, and the fundamental economics of supply and demand. Be specific about the mechanism by which the policy affects prices.
            `,
            renters_rights: `
**FRAMEWORK:** Score based on the policy's impact on renters' rights and protections, considering:
- **Security of Tenure**: Stability, protection from arbitrary eviction, long-term housing security
- **Eviction Protections**: Due process, notice periods, grounds for eviction, anti-retaliation measures
- **Affordability Protections**: Rent controls, rent caps, protection from excessive increases
- **Housing Quality**: Standards for maintenance, repairs, habitability, enforcement mechanisms
- **Legal Protections**: Access to justice, dispute resolution, tenant representation, enforcement of rights
- **Power Balance**: Shifting power dynamics between landlords and tenants

**Score (1-10):** Rate the policy's net impact on renters' rights and protections:

**1-2: Severe Harm to Renters' Rights** - Policy significantly weakens tenant protections
- Examples: Eliminating no-fault eviction bans, removing rent controls without replacements, weakening habitability standards, restricting tenants' legal recourse, enabling retaliatory evictions
- Evidence: Reduced security of tenure, increased eviction rates, loss of affordability protections
- Rights framework: Violates right to adequate housing (ICESCR Article 11), increases housing insecurity

**3-4: Moderate Harm to Renters' Rights** - Policy weakens some tenant protections
- Examples: Shortening notice periods, narrowing grounds for rent increase challenges, reducing maintenance obligations, limiting access to dispute resolution
- Evidence: Modest reduction in tenant security or legal protections
- Rights framework: Shifts power balance toward landlords without offsetting protections

**5: Neutral** - Policy has NO significant net impact on renters' rights OR positive and negative effects balance
- Examples: Administrative changes without substantive impact, policies affecting landlords and tenants equally, procedural updates maintaining status quo
- Key test: Would tenant advocacy organizations see this as materially affecting renters' rights? If no, score 5.

**6-7: Moderate Improvement to Renters' Rights** - Policy enhances tenant protections
- Examples: Extending notice periods, strengthening grounds needed for eviction, moderate rent increase caps, improved maintenance enforcement, better access to legal aid
- Evidence: Increased security of tenure, reduced arbitrary evictions, better affordability protections
- Rights framework: Advances right to adequate housing, improves power balance

**8-10: Significant Improvement to Renters' Rights** - Policy substantially strengthens tenant protections
- Examples: Abolishing Section 21 no-fault evictions, comprehensive rent controls, strong anti-retaliation provisions, guaranteed legal representation, robust habitability standards with enforcement
- Evidence: Major increase in housing security, strong affordability protections, enforceable rights
- Rights framework: Transforms tenant-landlord relationship, recognizes housing as human right

**Weight (1-3):** Based on the FUNDAMENTALITY and SCALE of rights affected:

**3: Fundamental Rights Affecting Millions** - Core housing security for large tenant population
- Security of tenure policies (no-fault eviction bans, long-term tenancy rights)
- National-level protections affecting >1 million renters
- Policies addressing fundamental housing instability or homelessness risk
- Rights with strong consensus on importance (e.g., protection from arbitrary eviction)

**2: Significant Rights for Substantial Population** - Important protections for many renters
- Rent control policies, eviction process reforms, quality standards
- Regional or sectoral policies affecting 100k-1M renters
- Policies improving but not fundamentally transforming tenant security
- Rights with moderate impact on housing stability

**1: Limited Scope or Administrative Rights** - Localized or procedural protections
- Minor procedural improvements, small-scale pilot programs
- Policies affecting <100k renters or specific circumstances
- Administrative changes with modest practical impact
- Important for affected individuals but limited broader significance

**GUIDANCE FOR COMPLEX RENTAL POLICIES:**

**Security of Tenure:**
- **No-Fault Eviction Ban** (abolishing Section 21): Major improvement (8-10, weight 3) - fundamental security increase
- **Extended Notice Periods**: Moderate improvement (6-7, weight 2) - better planning time but doesn't prevent eviction
- **Eviction Moratoriums**: Temporary improvement (6-7, weight 2-3 depending on scale) unless permanent
- **Stronger Eviction Grounds**: Improvement if it restricts arbitrary evictions (6-8, weight 2-3)

**Affordability Protections:**
- **Comprehensive Rent Controls**: Major improvement (8-9, weight 3) if well-designed; may be neutral (5) or harmful (3-4) if poorly designed reducing supply
- **Rent Increase Caps** (e.g., CPI-linked): Moderate improvement (6-7, weight 2) - limits exploitation without full control
- **Rent Transparency Requirements**: Minor improvement (5-6, weight 1) - information helps but doesn't guarantee affordability
- **First-Month Rent Caps**: Limited improvement (5-6, weight 1) - addresses entry barrier but not ongoing costs

**Tenant Protections:**
- **Anti-Retaliation Laws**: Significant improvement (7-8, weight 2) - enables tenants to exercise other rights
- **Repair and Maintenance Standards**: Moderate improvement (6-7, weight 2) if enforceable; neutral (5) if aspirational
- **Right to Legal Representation**: Significant improvement (7-8, weight 2) - levels playing field in disputes
- **Deposit Protection Schemes**: Moderate improvement (6-7, weight 2) - protects tenants from abuse

**Landlord Protections (Balanced Approach):**
- Policies that ONLY strengthen landlord rights without tenant protections: Score 2-4, weight 1-2
- Policies that balance landlord and tenant needs fairly: Score 5-6, weight 1
- Remember: The framework asks specifically about RENTERS' rights, so landlord-focused policies score low unless they have demonstrable tenant benefits

**Evidence-Based Reasoning:**
Reference tenant rights frameworks (ICESCR, domestic case law), eviction statistics, comparative international standards, research on housing security and health outcomes, and tenant advocacy positions. Be specific about which rights are affected and how.

**IMPORTANT CONSIDERATIONS:**
- Distinguish between policies that *enable* tenant protections (good) vs. policies that merely *study* issues (neutral)
- Consider enforcement mechanisms - rights without enforcement are worth less
- Weigh immediate impact vs. long-term cultural change in landlord-tenant relationships
- Consider intersectional impacts (e.g., policies particularly affecting low-income renters, families, disabled people)
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

