export interface TopicConfig {
    file: string;
    criteria: string[];
    prompts: Record<string, string>;
}

export const TOPIC_CONFIGS: Record<string, TopicConfig> = {
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
        criteria: ["climate_impact", "biodiversity", "financial_risk"],
        prompts: {
            climate_impact: `
**FRAMEWORK:** Score based on the policy's impact on climate goals, considering:
- **Emissions Impact**: Direct and indirect greenhouse gas emissions changes
- **Energy Transition**: Contribution to renewable energy and low-carbon infrastructure
- **Climate Targets**: Alignment with net zero commitments and Paris Agreement goals
- **Adaptation & Resilience**: Climate adaptation measures and vulnerability reduction
- **Systemic Change**: Long-term transformation of carbon-intensive systems

**Score (1-10):** Rate the policy's net climate impact:

**1-2: Severe Harm** - Policy significantly increases emissions or blocks climate action
- Examples: New fossil fuel infrastructure without carbon capture, removing emissions regulations, cancelling renewable energy programs, policies locking in high-carbon pathways
- Evidence: Major emissions increases (>1 MtCO2e annually), undermining net zero targets, blocking climate legislation

**3-4: Moderate Harm** - Policy weakens environmental standards or delays climate action
- Examples: Weakening building efficiency standards, reducing carbon pricing, delaying renewable energy transitions, subsidizing carbon-intensive industries without conditions
- Evidence: Measurable emissions increases (<1 MtCO2e annually), slower progress toward climate targets

**5: Neutral** - Policy has NO significant net climate impact OR positive and negative effects balance
- Examples: Administrative changes without emissions impact, policies affecting minimal energy use, revenue-neutral changes
- Key test: Would climate scientists expect measurable emissions or climate target effects? If no, score 5.

**6-7: Moderate Improvement** - Policy reduces emissions or supports climate goals
- Examples: Energy efficiency standards, renewable energy incentives, public transport expansion, sustainable agriculture support, carbon pricing mechanisms
- Evidence: Measurable emissions reductions (<1 MtCO2e annually), improved alignment with climate targets

**8-10: Significant Improvement** - Policy drives transformative climate action or major emissions cuts
- Examples: Large-scale renewable energy deployment, fossil fuel phase-outs, comprehensive net zero legislation, major green infrastructure programs, carbon capture at scale
- Evidence: Major emissions reductions (>1 MtCO2e annually), paradigm shifts in energy/transport/land use, achieving or exceeding net zero targets

**Weight (1-3):** Based on the SCALE and CRITICALITY of climate impact:

**3: Critical Impact on Climate Goals** - Policies affecting major emissions sources or systemic change
- National energy policy, large infrastructure decisions, economy-wide carbon pricing
- Policies affecting >5 MtCO2e annually or critical to net zero pathway
- Decisions on fossil fuel infrastructure, major renewable energy deployment

**2: Significant Sectoral Impact** - Substantial effects on specific sectors or regions
- Transport policies, building standards, agricultural reforms, industrial emissions
- Policies affecting 1-5 MtCO2e annually
- Sector-specific transitions (e.g., coal phase-out, aviation decarbonization)

**1: Minor or Indirect Climate Effects** - Limited or localized climate impact
- Small-scale efficiency measures, pilot programs, local initiatives
- Policies affecting <1 MtCO2e annually
- Administrative changes with minimal emissions impact

**GUIDANCE FOR COMPLEX CLIMATE POLICIES:**

**Energy Transition:**
- Renewable energy deployment = Positive (7-10, weight 2-3)
- Fossil fuel phase-outs = Positive (8-10, weight 3)
- Carbon capture and storage = Positive (6-8, weight 2) if genuine, not greenwashing
- Nuclear energy = Context-dependent (5-7, weight 2) - consider displacement of renewables vs. coal

**Nature-Based Solutions:**
- Afforestation/reforestation = Positive (6-8, weight 2) if permanent and well-designed
- Peatland restoration = Positive (7-9, weight 2) - high carbon storage potential
- Agricultural soil carbon = Positive (6-7, weight 1-2) - measurement challenges

**Trade-offs:**
- Policies with short-term emissions for long-term gains: Score based on net lifecycle impact
- Economic growth vs. emissions: Favor absolute emissions reductions over carbon intensity improvements alone
            `,
            biodiversity: `
**FRAMEWORK:** Score based on the policy's impact on biodiversity and ecosystems, considering:
- **Habitat Protection**: Conservation of critical habitats and ecosystems
- **Species Protection**: Impact on threatened/endangered species populations
- **Ecosystem Services**: Effects on pollination, water purification, soil health, carbon sequestration
- **Pollution & Degradation**: Chemical pollution, plastic waste, habitat fragmentation
- **Restoration & Recovery**: Active restoration of degraded ecosystems

**Score (1-10):** Rate the policy's net biodiversity impact:

**1-2: Severe Harm** - Policy causes major habitat destruction or species extinction risk
- Examples: Deforestation, destruction of critical habitats (wetlands, coral reefs), weakening endangered species protections, enabling major pollution events
- Evidence: Habitat loss >1000 ha of critical habitat, threats to endangered species, ecosystem collapse risk

**3-4: Moderate Harm** - Policy weakens protections or increases pollution/degradation
- Examples: Reduced habitat protections, increased pesticide/chemical use, weakening environmental impact assessments, policies enabling habitat fragmentation
- Evidence: Measurable habitat degradation, population declines in indicator species, increased pollution levels

**5: Neutral** - Policy has NO significant net biodiversity impact OR effects balance out
- Examples: Administrative changes without habitat/species impact, policies affecting areas with minimal biodiversity value
- Key test: Would ecologists expect measurable impacts on species or ecosystems? If no, score 5.

**6-7: Moderate Improvement** - Policy enhances habitat protection or reduces pollution
- Examples: Protected area designation (smaller scale), pollution reduction measures, sustainable land management incentives, wildlife corridor creation
- Evidence: Habitat protection/improvement, reduced pollution levels, stabilization of declining species

**8-10: Significant Improvement** - Policy drives major conservation or ecosystem restoration
- Examples: Large-scale habitat restoration, comprehensive species recovery programs, banning harmful chemicals (e.g., neonicotinoids), major marine protected areas, rewilding initiatives
- Evidence: Major habitat restoration (>1000 ha), species population recovery, ecosystem function restoration, measurable biodiversity increases

**Weight (1-3):** Based on the ECOLOGICAL CRITICALITY and SCALE:

**3: Critical Impact on Ecosystems or Endangered Species** - Policies affecting irreplaceable biodiversity
- Impacts on critically endangered species, unique ecosystems, or biodiversity hotspots
- Policies affecting >10,000 ha of critical habitat or multiple threatened species
- Decisions on major infrastructure affecting high-biodiversity areas

**2: Significant Impact on Habitats or Wildlife Populations** - Substantial ecological effects
- Impacts on protected species, important habitats, or sensitive ecosystems
- Policies affecting 1,000-10,000 ha or regional biodiversity
- Sector-specific impacts (agriculture, fisheries, forestry)

**1: Minor or Localized Biodiversity Effects** - Limited ecological impact
- Small-scale local impacts, common species only
- Policies affecting <1,000 ha of non-critical habitat
- Administrative changes with minimal biodiversity consequences

**GUIDANCE FOR COMPLEX BIODIVERSITY POLICIES:**

**Habitat Protection:**
- Protected area designation = Positive (7-10, weight 2-3) depending on ecological value
- Habitat restoration = Positive (6-9, weight 2-3) if evidence-based and well-managed
- Development in green belt/countryside = Negative (2-5, weight 1-2) depending on biodiversity value

**Agricultural Policies:**
- Pesticide bans = Positive (7-9, weight 2-3) for critical pollinators
- Agri-environment schemes = Positive (6-8, weight 2) if well-designed
- Intensive agriculture support = Negative (3-5, weight 2)

**Marine & Freshwater:**
- Marine protected areas = Positive (7-10, weight 3) if enforced
- Overfishing controls = Positive (6-8, weight 2-3)
- Water pollution controls = Positive (6-8, weight 2)

**Trade-offs:**
- Development vs. conservation: Weight heavily toward irreplaceable biodiversity
- Economic use vs. protection: Consider ecosystem services value in economic calculus
            `,
            financial_risk: `
**FRAMEWORK:** Score based on the policy's impact on climate-related financial risks, considering:
- **Transition Risk**: Risks from the shift to a low-carbon economy (stranded assets, policy changes, technology shifts)
- **Physical Risk**: Risks from climate change impacts (extreme weather, sea-level rise, supply chain disruption)
- **Financial Stability**: Systemic risks to the financial system from climate exposure
- **Investment Certainty**: Clarity and stability of policy signals for green investment
- **Disclosure & Transparency**: Requirements for reporting climate risks

**Score (1-10):** Rate the policy's impact on reducing climate financial risk:

**1-2: Significantly Increases Risk** - Policy locks in high-risk assets or ignores physical threats
- Examples: Encouraging long-term fossil fuel infrastructure (stranded asset risk), removing climate risk disclosure rules, ignoring adaptation needs in infrastructure planning
- Evidence: Increased exposure to transition risks, lack of resilience planning, creating policy uncertainty
- Financial implication: Higher cost of capital, potential asset write-downs, systemic instability

**3-4: Moderately Increases Risk** - Policy fails to address risks or creates minor uncertainty
- Examples: Weakening green investment standards, delaying transition timelines (increasing "cliff-edge" risk), insufficient adaptation funding
- Evidence: Continued investment in high-risk sectors without transition plans, inadequate risk assessment
- Financial implication: Mispricing of risk, delayed adaptation increasing future costs

**5: Neutral** - Policy has NO significant net impact on climate financial risk
- Examples: Administrative changes, policies with balanced risk/opportunity profiles
- Key test: Would financial regulators or risk managers see this as changing the risk profile? If no, score 5.

**6-7: Moderately Reduces Risk** - Policy improves risk management or investment certainty
- Examples: Mandatory climate risk disclosure (TCFD), green taxonomy implementation, clear transition roadmaps, adaptation funding
- Evidence: Improved market information, clearer policy signals, reduced physical vulnerability
- Financial implication: Better capital allocation, reduced uncertainty premiums

**8-10: Significantly Reduces Risk** - Policy actively mitigates major financial risks
- Examples: Comprehensive net zero transition plan with clear sector pathways, robust adaptation infrastructure investment, stress testing financial institutions for climate risk, phasing out high-risk assets
- Evidence: Major reduction in transition risk exposure, significant resilience improvements, aligning financial flows with net zero
- Financial implication: Long-term financial stability, orderly transition, protected asset values

**Weight (1-3):** Based on the SCALE and SYSTEMIC NATURE of the risk:

**3: Systemic/National Financial Impact** - Affects the stability of the financial system or major economic sectors
- Banking/insurance sector regulation, national infrastructure resilience, economy-wide transition plans
- Policies affecting >£10bn in assets or investment

**2: Significant Sectoral/Regional Impact** - Substantial effects on specific industries or asset classes
- Sector-specific transition plans (energy, transport), regional adaptation projects
- Policies affecting £1-10bn in assets

**1: Minor/Localized Financial Impact** - Limited scope
- Small-scale grants, local disclosure pilots
- Policies affecting <£1bn in assets

**GUIDANCE FOR COMPLEX FINANCIAL RISK POLICIES:**

**Transition vs. Physical Risk:**
- Reducing transition risk (e.g., clear net zero path) = Positive (7-10)
- Ignoring physical risk (e.g., building on floodplains) = Negative (2-4)
- Managing both (e.g., resilient green infrastructure) = High Positive (9-10)

**Stranded Assets:**
- Policies extending fossil fuel life = High Risk (1-3) due to future write-down potential
- Policies managing managed decline = Risk Reduction (7-9)

**Greenwashing:**
- "Green" policies without substance = Neutral or Low Positive (5-6)
- Robust, science-based standards = High Positive (8-10)
            `,
        },
    },
    economic: {
        file: "policies-economic.json",
        criteria: ["inequality", "economic_democracy"],
        prompts: {
            inequality: `
**FRAMEWORK:** Score based on the policy's impact on wealth and income distribution, considering:
- **Income Distribution**: Effects on wages, earnings, and income across economic classes
- **Wealth Distribution**: Impacts on asset ownership, property, and accumulated wealth
- **Access to Services**: Effects on access to healthcare, education, housing, and essential services
- **Regional Inequality**: Geographic distribution of economic opportunities
- **Intergenerational Equity**: Long-term impacts on wealth concentration and mobility

**Score (1-10):** Rate the policy's net impact on inequality:

**1-2: Severe Increase in Inequality** - Policy drastically worsens wealth/income gaps
- Examples: Major regressive tax cuts (e.g., abolishing top income tax rates), deep cuts to social safety net, privatization of essential services without safeguards, policies enabling wealth concentration
- Evidence: Gini coefficient increases >2 points, millions pushed into poverty, massive wealth transfers to top 10%

**3-4: Moderate Increase in Inequality** - Policy favors wealthy at expense of lower/middle income
- Examples: Regressive taxation (VAT increases, income tax cuts for high earners), reduced welfare benefits, subsidies for asset owners (e.g., property tax breaks), austerity measures
- Evidence: Measurable income/wealth gap increases, reduced redistributive effect of tax/benefit system

**5: Neutral** - Policy has NO significant net impact on inequality OR effects balance
- Examples: Administrative changes, revenue-neutral tax reforms, policies affecting all groups equally
- Key test: Would inequality researchers expect measurable impacts on income/wealth distribution? If no, score 5.

**6-7: Moderate Reduction in Inequality** - Policy improves distribution modestly
- Examples: Progressive taxation (higher top rates, wealth taxes), welfare expansion, minimum wage increases, affordable housing programs, universal free school meals
- Evidence: Measurable reduction in income gaps, improved social mobility, reduced poverty rates

**8-10: Significant Reduction in Inequality** - Policy drives major redistributive change
- Examples: Comprehensive wealth redistribution, universal basic income/services, major progressive tax reform, large-scale social housing, free higher education, nationalization of utilities with universal access
- Evidence: Gini coefficient decreases >2 points, major poverty reduction, substantial wealth redistribution

**Weight (1-3):** Based on the SCALE and DISTRIBUTIVE IMPACT:

**3: Major Impact on Wealth/Income Distribution** - Policies affecting millions or fundamental distribution
- National tax/benefit system reforms affecting >£10bn annually
- Policies with clear impacts on millions of households
- Fundamental changes to property/wealth ownership structures

**2: Significant Impact on Specific Groups or Regions** - Substantial distributive effects
- Sectoral wage policies, regional development programs, targeted welfare reforms
- Policies affecting £1-10bn annually or specific vulnerable groups
- Significant impacts on poverty or social mobility

**1: Minor or Indirect Inequality Effects** - Limited distributive impact
- Small-scale programs, administrative changes, localized policies
- Policies affecting <£1bn annually
- Minimal measurable impact on overall inequality metrics

**GUIDANCE FOR COMPLEX INEQUALITY POLICIES:**

**Tax Policies:**
- Progressive income/wealth taxes = Positive (7-10, weight 3)
- Regressive consumption taxes = Negative (3-5, weight 2)
- Tax avoidance crackdowns = Positive (6-8, weight 2-3)
- Corporate tax cuts without conditions = Negative (3-5, weight 2)

**Welfare & Services:**
- Universal basic services (NHS, education) = Positive (8-10, weight 3)
- Means-tested benefit increases = Positive (6-8, weight 2)
- Benefit cuts/sanctions = Negative (2-5, weight 2-3)
- Privatization of essentials = Negative (2-5, weight 2-3)

**Labor Market:**
- Minimum/living wage increases = Positive (6-8, weight 2)
- Worker rights strengthening = Positive (6-7, weight 2)
- Zero-hours contract restrictions = Positive (6-7, weight 1-2)
- Anti-union legislation = Negative (3-5, weight 2)

**Housing & Assets:**
- Social housing construction = Positive (7-9, weight 2-3)
- First-time buyer subsidies without supply = Negative (3-5, weight 2) - increases prices
- Rent controls (well-designed) = Positive (6-8, weight 2)
- Property tax breaks for landlords = Negative (3-5, weight 2)

**Trade-offs:**
- Growth vs. distribution: Favor policies reducing inequality even if modest growth trade-off
- Means-testing vs. universalism: Universal services generally score higher (broader access, less stigma)
            `,
            economic_democracy: `
**FRAMEWORK:** Score based on the policy's impact on democratic control of the economy, considering:
- **Worker Control**: Employee ownership, worker representation, collective bargaining rights
- **Public Ownership**: Democratic control of key economic sectors and infrastructure
- **Corporate Accountability**: Democratic oversight of private corporations, stakeholder governance
- **Community Wealth**: Community ownership, cooperatives, mutual societies
- **Economic Planning**: Democratic participation in economic decision-making

**Score (1-10):** Rate the policy's net impact on economic democracy:

**1-2: Severe Harm** - Policy drastically reduces democratic economic control
- Examples: Major privatization of public services (NHS, railways, utilities), banning trade unions, removing worker representation, enabling corporate monopolies, deregulation removing democratic oversight
- Evidence: Major shift from public/worker control to private ownership, elimination of democratic participation mechanisms

**3-4: Moderate Harm** - Policy weakens democratic economic controls
- Examples: Partial privatization, weakening trade union rights, reducing worker representation, limiting public accountability of corporations, enabling corporate consolidation
- Evidence: Measurable reduction in worker/public control, reduced democratic participation in economic decisions

**5: Neutral** - Policy has NO significant impact on economic democracy OR effects balance
- Examples: Administrative changes, technical regulations without governance implications
- Key test: Does the policy shift power between workers/public and capital/management? If no, score 5.

**6-7: Moderate Improvement** - Policy enhances democratic economic participation
- Examples: Worker representation on boards, strengthened collective bargaining, cooperative support programs, public procurement favoring worker-owned firms, transparency requirements for corporations
- Evidence: Increased worker participation, new democratic economic institutions, improved accountability

**8-10: Significant Improvement** - Policy fundamentally democratizes economic control
- Examples: Large-scale nationalization with democratic governance (public ownership of energy, rail, water), worker buyout funds, mandatory worker ownership stakes, economy-wide worker board representation, comprehensive cooperative development, democratic planning institutions
- Evidence: Major shift toward worker/public ownership, transformation of governance structures, economy-wide democratic participation

**Weight (1-3):** Based on the SCALE and FUNDAMENTALITY of democratic control:

**3: Major Shift in Ownership or Control of Key Sectors** - Fundamental economic governance changes
- Nationalization/privatization of major industries (energy, transport, finance, utilities)
- Economy-wide worker participation requirements
- Policies affecting >£10bn in assets or millions of workers

**2: Significant Changes to Worker Rights or Democratic Participation** - Important governance reforms
- Sectoral collective bargaining, worker board representation, cooperative expansion
- Policies affecting specific industries or regional economies
- Reforms affecting hundreds of thousands of workers

**1: Minor or Localized Effects on Economic Democracy** - Limited governance impact
- Pilot programs, small-scale cooperative support, transparency improvements
- Policies affecting <100,000 workers or specific localities
- Procedural changes with minimal structural impact

**GUIDANCE FOR COMPLEX ECONOMIC DEMOCRACY POLICIES:**

**Public Ownership:**
- Nationalization with democratic governance = Positive (8-10, weight 3)
- Nationalization without worker/user participation = Moderate Positive (6-7, weight 2-3)
- Privatization of utilities/services = Negative (2-4, weight 3)
- Municipal/cooperative ownership = Positive (7-9, weight 2)

**Worker Participation:**
- German-style co-determination (board seats) = Positive (7-9, weight 2-3)
- Sectoral collective bargaining = Positive (7-8, weight 2)
- Worker buyout support = Positive (7-9, weight 2)
- Trade union recognition rights = Positive (6-8, weight 2)
- Anti-union legislation = Negative (2-4, weight 2)

**Cooperative & Community:**
- Cooperative development banks = Positive (7-8, weight 2)
- Right to buy for workers = Positive (8-9, weight 2-3)
- Community wealth building = Positive (6-8, weight 2)
- Mutual/cooperative tax advantages = Positive (6-7, weight 1-2)

**Corporate Governance:**
- Stakeholder governance requirements = Positive (6-8, weight 2)
- Transparency and accountability measures = Positive (5-7, weight 1-2)
- Deregulation reducing oversight = Negative (3-5, weight 2)
- Enabling monopolies/oligopolies = Negative (3-5, weight 2-3)

**Trade-offs:**
- Efficiency vs. democracy: Favor democratic control even if some efficiency trade-offs
- Public vs. cooperative ownership: Both positive; cooperatives slightly favored for deeper democracy
- Participation vs. speed: Favor inclusive decision-making over technocratic efficiency
            `,
        },
    },
    housing: {
        file: "policies-housing.json",
        criteria: ["affordability", "renters_rights"],
        prompts: {
            affordability: `
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
