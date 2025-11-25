<script lang="ts">
    import PolicyChart from "$lib/components/PolicyChart.svelte";
    import migrationPolicies from "$lib/data/policies-migration.json";
    import environmentalPolicies from "$lib/data/policies-environmental.json";
    import economicPolicies from "$lib/data/policies-economic.json";

    type Topic = "migration" | "environmental" | "economic";

    const topics = {
        migration: {
            data: migrationPolicies,
            title: "Migration Policy",
            subtitle: "Human Rights & Economic Impact Tracker",
            criteria: ["human_rights", "economic_impact"],
            criteriaLabels: {
                human_rights: "Human Rights",
                economic_impact: "Economic Impact",
            },
        },
        environmental: {
            data: environmentalPolicies,
            title: "Environmental Policy",
            subtitle: "Climate Impact & Biodiversity Tracker",
            criteria: ["climate_impact", "biodiversity"],
            criteriaLabels: {
                climate_impact: "Climate Impact",
                biodiversity: "Biodiversity",
            },
        },
        economic: {
            data: economicPolicies,
            title: "Economic Policy",
            subtitle: "Inequality & Economic Democracy Tracker",
            criteria: ["inequality", "economic_democracy"],
            criteriaLabels: {
                inequality: "Inequality",
                economic_democracy: "Economic Democracy",
            },
        },
    };

    let activeTopic = $state<Topic>("migration");
    let activeCriterion = $state<string>("human_rights");
    let methodologyOpen = $state(false);

    // Update criterion when topic changes
    $effect(() => {
        activeCriterion = topics[activeTopic].criteria[0];
    });
</script>

<div class="bg-amber-50 border-b border-amber-200 px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center gap-3 text-amber-800">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5 shrink-0"
        >
            <path
                fill-rule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
            />
        </svg>
        <p class="text-sm font-medium">
            Proof of Concept: Data is for demonstration purposes only and has
            not been verified.
        </p>
    </div>
</div>

<div class="min-h-screen bg-gray-50 p-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-8">
        <header class="text-center space-y-4">
            <h1
                class="text-5xl font-bold text-gray-900 tracking-tight font-display"
            >
                2025 UK Policy Tracker
            </h1>
            <p
                class="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed"
            >
                Tracking the impact of UK political party policies across
                multiple dimensions. Scores range from <span
                    class="font-semibold text-red-600">1 (Severe Harm)</span
                >
                to
                <span class="font-semibold text-green-600"
                    >10 (Substantial Improvement)</span
                >.
            </p>
        </header>

        <!-- Methodology Section (Collapsible) -->
        <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
            <button
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onclick={() => (methodologyOpen = !methodologyOpen)}
            >
                <div class="flex items-center gap-3">
                    <svg
                        class="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900">
                        Methodology & Scoring Framework
                    </h3>
                </div>
                <svg
                    class="w-5 h-5 text-gray-500 transition-transform duration-200"
                    class:rotate-180={methodologyOpen}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {#if methodologyOpen}
                <div class="px-6 pb-6 space-y-6 text-gray-700">
                    <!-- Overview -->
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-2">
                            Overview
                        </h4>
                        <p class="text-sm leading-relaxed">
                            This tracker uses AI-powered analysis to score UK
                            political party policies across multiple dimensions.
                            Each policy is evaluated by Google's Gemini 2.0
                            Flash model using structured prompts grounded in
                            international law, economic theory, and
                            environmental science. Scores range from <strong
                                class="text-red-600">1 (Severe Harm)</strong
                            >
                            to
                            <strong class="text-green-600"
                                >10 (Substantial Improvement)</strong
                            >, with
                            <strong>5 representing neutral impact</strong>.
                        </p>
                    </div>

                    <!-- Scoring Criteria -->
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-3">
                            Scoring Criteria
                        </h4>
                        <div class="space-y-4">
                            <!-- Human Rights -->
                            <div
                                class="bg-blue-50 border border-blue-200 rounded-lg p-4"
                            >
                                <h5 class="font-semibold text-blue-900 mb-2">
                                    Human Rights (Migration)
                                </h5>
                                <p class="text-sm mb-2">
                                    Policies are scored based on compliance with
                                    international human rights law:
                                </p>
                                <ul class="text-sm space-y-1 ml-4 list-disc">
                                    <li>
                                        <strong
                                            >European Convention on Human Rights
                                            (ECHR)</strong
                                        >: Articles 2 (Life), 3 (Torture), 5
                                        (Liberty), 6 (Fair Trial), 8 (Family
                                        Life), 13 (Effective Remedy)
                                    </li>
                                    <li>
                                        <strong>1951 Refugee Convention</strong
                                        >: Non-refoulement (Article 33), access
                                        to asylum procedures
                                    </li>
                                    <li>
                                        <strong
                                            >International Covenant on Civil and
                                            Political Rights (ICCPR)</strong
                                        >
                                    </li>
                                    <li>
                                        <strong
                                            >UN Convention on the Rights of the
                                            Child (CRC)</strong
                                        >
                                    </li>
                                </ul>
                                <p class="text-sm mt-2">
                                    <strong>Weight (1-3)</strong> is assigned based
                                    on the category of right affected: 3 for absolute
                                    rights (life, torture, non-refoulement), 2 for
                                    qualified rights (family life, due process),
                                    1 for administrative measures.
                                </p>
                            </div>

                            <!-- Economic Impact -->
                            <div
                                class="bg-green-50 border border-green-200 rounded-lg p-4"
                            >
                                <h5 class="font-semibold text-green-900 mb-2">
                                    Economic Impact (Migration)
                                </h5>
                                <p class="text-sm mb-2">
                                    Policies are evaluated based on
                                    evidence-based economic analysis:
                                </p>
                                <ul class="text-sm space-y-1 ml-4 list-disc">
                                    <li>
                                        <strong>Labour Market Effects</strong>:
                                        Employment levels, wages, skills
                                        matching, productivity
                                    </li>
                                    <li>
                                        <strong>Fiscal Impact</strong>: Tax
                                        revenue, public spending, cost-benefit
                                        to taxpayers
                                    </li>
                                    <li>
                                        <strong>Sectoral Impact</strong>:
                                        Effects on healthcare, agriculture,
                                        tech, hospitality
                                    </li>
                                    <li>
                                        <strong>Innovation & Growth</strong>:
                                        Long-term productivity,
                                        entrepreneurship, knowledge transfer
                                    </li>
                                </ul>
                                <p class="text-sm mt-2">
                                    <strong>Weight (1-3)</strong> reflects the scale
                                    of impact: 3 for national-level effects (>£1bn
                                    annually), 2 for sectoral/regional impact (£100m-£1bn),
                                    1 for minor/localized effects.
                                </p>
                            </div>

                            <!-- Climate Impact -->
                            <div
                                class="bg-amber-50 border border-amber-200 rounded-lg p-4"
                            >
                                <h5 class="font-semibold text-amber-900 mb-2">
                                    Climate Impact (Environmental)
                                </h5>
                                <p class="text-sm">
                                    Policies are assessed on their contribution
                                    to climate goals, emissions reduction, and
                                    alignment with net zero commitments. Weight
                                    reflects the criticality of impact on
                                    climate targets.
                                </p>
                            </div>

                            <!-- Other criteria can be added similarly -->
                        </div>
                    </div>

                    <!-- AI Analysis -->
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-2">
                            AI-Powered Analysis
                        </h4>
                        <p class="text-sm leading-relaxed">
                            Each policy is analyzed by Google's Gemini 2.5 Flash
                            model, which provides:
                        </p>
                        <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                            <li>
                                <strong>Score (1-10)</strong>: Numerical rating
                                of the policy's impact
                            </li>
                            <li>
                                <strong>Weight (1-3)</strong>:
                                Importance/severity of the rights or impacts
                                affected
                            </li>
                            <li>
                                <strong>Reasoning</strong>: Detailed explanation
                                of the score, referencing specific legal
                                standards or economic evidence
                            </li>
                        </ul>
                    </div>

                    <!-- Limitations -->
                    <div
                        class="bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                        <h4
                            class="font-semibold text-amber-900 mb-2 flex items-center gap-2"
                        >
                            <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            Limitations
                        </h4>
                        <p class="text-sm">
                            AI-generated scores are based on policy text and
                            publicly available information. They represent
                            analytical assessments, not definitive judgments.
                            Users should critically evaluate the reasoning
                            provided and consider multiple perspectives when
                            interpreting results.
                        </p>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Topic Tabs -->
        <div class="flex justify-center">
            <div
                class="inline-flex bg-white rounded-lg shadow-sm border border-gray-200 p-1"
            >
                {#each Object.entries(topics) as [topicKey, topicData]}
                    <button
                        class="px-6 py-2 rounded-md font-medium text-sm transition-all duration-200"
                        class:bg-blue-600={activeTopic === topicKey}
                        class:text-white={activeTopic === topicKey}
                        class:text-gray-700={activeTopic !== topicKey}
                        class:hover:bg-gray-100={activeTopic !== topicKey}
                        onclick={() => (activeTopic = topicKey as Topic)}
                    >
                        {topicData.title}
                    </button>
                {/each}
            </div>
        </div>

        <main>
            <!-- Topic Header -->
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">
                    {topics[activeTopic].title}
                </h2>
                <p class="text-lg text-gray-600 italic">
                    {topics[activeTopic].subtitle}
                </p>
            </div>

            <!-- Criterion Selector -->
            <div class="flex justify-center mb-6">
                <div
                    class="inline-flex bg-white rounded-lg shadow-sm border border-gray-200 p-1"
                >
                    {#each topics[activeTopic].criteria as criterion}
                        <button
                            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200"
                            class:bg-indigo-600={activeCriterion === criterion}
                            class:text-white={activeCriterion === criterion}
                            class:text-gray-700={activeCriterion !== criterion}
                            class:hover:bg-gray-100={activeCriterion !==
                                criterion}
                            onclick={() => (activeCriterion = criterion)}
                        >
                            {topics[activeTopic].criteriaLabels[criterion]}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Policy Chart -->
            {#snippet policyChartOrEmpty()}
                {@const hasData =
                    topics[activeTopic].data.length > 0 &&
                    topics[activeTopic].data.some((p) => p.policies.length > 0)}
                {@const hasScoredPolicies =
                    hasData &&
                    topics[activeTopic].data.some((p) =>
                        p.policies.some(
                            (policy) => policy.scores?.[activeCriterion],
                        ),
                    )}

                {#if hasScoredPolicies}
                    <PolicyChart
                        data={topics[activeTopic].data}
                        criterion={activeCriterion}
                    />
                {:else if hasData}
                    <div
                        class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
                    >
                        <svg
                            class="w-16 h-16 mx-auto text-amber-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">
                            No Scores for "{topics[activeTopic].criteriaLabels[
                                activeCriterion
                            ]}"
                        </h3>
                        <p class="text-gray-600 mb-4">
                            Policies exist for {topics[
                                activeTopic
                            ].title.toLowerCase()}, but they haven't been scored
                            for this criterion yet.
                        </p>
                    </div>
                {:else}
                    <div
                        class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
                    >
                        <svg
                            class="w-16 h-16 mx-auto text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">
                            No Data Available
                        </h3>
                        <p class="text-gray-600">
                            Policy data for {topics[
                                activeTopic
                            ].title.toLowerCase()} has not been added yet.
                        </p>
                    </div>
                {/if}
            {/snippet}

            {@render policyChartOrEmpty()}
        </main>

        <footer
            class="text-center text-sm text-gray-500 pt-8 border-t border-gray-200"
        >
            <p>Data visualization powered by D3.js and SvelteKit.</p>
        </footer>
    </div>
</div>
