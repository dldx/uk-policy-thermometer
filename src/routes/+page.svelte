<script lang="ts">
    import PolicyChart from "$lib/components/PolicyChart.svelte";
    import SkyDecoration from "$lib/components/SkyDecoration.svelte";
    import GroundLayer from "$lib/components/GroundLayer.svelte";
    import migrationPolicies from "$lib/data/policies-migration.json";
    import environmentalPolicies from "$lib/data/policies-environmental.json";
    import economicPolicies from "$lib/data/policies-economic.json";
    import housingPolicies from "$lib/data/policies-housing.json";
    import { TOPIC_CONFIGS } from "$lib/data/scoring-criteria";

    type Topic = "migration" | "environmental" | "economic" | "housing";

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
            criteria: ["climate_impact", "biodiversity", "financial_risk"],
            criteriaLabels: {
                climate_impact: "Climate Impact",
                biodiversity: "Biodiversity",
                financial_risk: "Financial Risk",
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
        housing: {
            data: housingPolicies,
            title: "Housing Policy",
            subtitle: "House Price & Rent Impact Tracker",
            criteria: ["affordability", "renters_rights"],
            criteriaLabels: {
                affordability: "Affordability",
                renters_rights: "Renters' Rights",
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

<SkyDecoration />

<div class="bg-amber-50 border-b border-amber-200 px-4 py-3">
    <div
        class="max-w-5xl mx-auto flex items-center justify-center gap-3 text-amber-800"
    >
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

<div
    class="min-h-screen p-8 font-sans overflow-hidden"
    style="background: linear-gradient(to bottom, #fb923c 0%, #fdba74 15%, #93c5fd 40%, #60a5fa 100%);"
>
    <div class="max-w-7xl mx-auto space-y-8 relative z-10">
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

            <!-- Policy Chart with Ground Layer Background -->
            <div class="relative isolate">
                <!-- Ground Layer (Breakout Background) -->
                <div
                    class="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-[5000px] -z-10 pointer-events-none translate-y-[calc(100%-150px)]"
                >
                    <GroundLayer />
                </div>

                {@render policyChartOrEmpty()}
            </div>

            <!-- Methodology Section (Collapsible) -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8 relative z-10"
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
                                This tracker uses AI-powered analysis to score
                                UK political party policies across multiple
                                dimensions. Each policy is evaluated by Google's
                                Gemini 2.0 Flash model using structured prompts
                                grounded in international law, economic theory,
                                and environmental science. Scores range from <strong
                                    class="text-red-600">1 (Severe Harm)</strong
                                >
                                to
                                <strong class="text-green-600"
                                    >10 (Substantial Improvement)</strong
                                >, with
                                <strong>5 representing neutral impact</strong>.
                            </p>
                        </div>

                        <!-- Scoring Criteria for Active Topic -->
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-3">
                                Scoring Criteria for {topics[activeTopic].title}
                            </h4>
                            <div class="space-y-4">
                                {#each TOPIC_CONFIGS[activeTopic].criteria as criterion, index}
                                    {@const colors = [
                                        {
                                            bg: "bg-blue-50",
                                            border: "border-blue-200",
                                            text: "text-blue-900",
                                        },
                                        {
                                            bg: "bg-green-50",
                                            border: "border-green-200",
                                            text: "text-green-900",
                                        },
                                        {
                                            bg: "bg-amber-50",
                                            border: "border-amber-200",
                                            text: "text-amber-900",
                                        },
                                        {
                                            bg: "bg-purple-50",
                                            border: "border-purple-200",
                                            text: "text-purple-900",
                                        },
                                    ]}
                                    {@const color =
                                        colors[index % colors.length]}
                                    <div
                                        class="{color.bg} border {color.border} rounded-lg p-4"
                                    >
                                        <h5
                                            class="font-semibold {color.text} mb-2"
                                        >
                                            {topics[activeTopic].criteriaLabels[
                                                criterion
                                            ]}
                                        </h5>
                                        <div
                                            class="whitespace-pre-line font-mono text-xs leading-relaxed"
                                        >
                                            {TOPIC_CONFIGS[activeTopic].prompts[
                                                criterion
                                            ]}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>

                        <!-- AI Analysis -->
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-2">
                                AI-Powered Analysis
                            </h4>
                            <p class="text-sm leading-relaxed">
                                Each policy is analyzed by Google's Gemini 2.5
                                Flash model, which provides:
                            </p>
                            <ul class="text-sm space-y-1 ml-4 list-disc mt-2">
                                <li>
                                    <strong>Score (1-10)</strong>: Numerical
                                    rating of the policy's impact
                                </li>
                                <li>
                                    <strong>Weight (1-3)</strong>:
                                    Importance/severity of the rights or impacts
                                    affected
                                </li>
                                <li>
                                    <strong>Reasoning</strong>: Detailed
                                    explanation of the score, referencing
                                    specific legal standards or economic
                                    evidence
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
                                analytical assessments, not definitive
                                judgments. Users should critically evaluate the
                                reasoning provided and consider multiple
                                perspectives when interpreting results.
                            </p>
                        </div>
                    </div>
                {/if}
            </div>
        </main>

        <footer
            class="text-center text-sm text-gray-500 pt-8 border-t border-gray-200 relative z-10"
        ></footer>
    </div>
</div>
