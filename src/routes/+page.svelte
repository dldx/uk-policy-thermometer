<script lang="ts">
    import PolicyChart from "$lib/components/PolicyChart.svelte";
    import SkyDecoration from "$lib/components/SkyDecoration.svelte";
    import GroundLayer from "$lib/components/GroundLayer.svelte";
    import Markdown from "$lib/components/Markdown.svelte";
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
            colors: {
                bg: "bg-blue-600",
                hover: "hover:bg-blue-50",
                border: "border-blue-100",
            },
            criteria: ["human_rights", "economic_impact"],
            criteriaLabels: {
                human_rights: "Human Rights",
                economic_impact: "Economic Impact",
            },
        },
        environmental: {
            data: environmentalPolicies,
            title: "Environmental Policy",
            colors: {
                bg: "bg-green-600",
                hover: "hover:bg-green-50",
                border: "border-green-100",
            },
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
            colors: {
                bg: "bg-amber-600",
                hover: "hover:bg-amber-50",
                border: "border-amber-100",
            },
            criteria: ["inequality", "economic_democracy"],
            criteriaLabels: {
                inequality: "Inequality",
                economic_democracy: "Economic Democracy",
            },
        },
        housing: {
            data: housingPolicies,
            title: "Housing Policy",
            colors: {
                bg: "bg-pink-600",
                hover: "hover:bg-pink-50",
                border: "border-pink-100",
            },
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

<div class="bg-amber-50 px-4 py-3 border-amber-200 border-b">
    <div
        class="flex justify-center items-center gap-3 mx-auto max-w-5xl text-amber-800"
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
        <p class="font-medium text-sm">
            Proof of Concept: Data is for demonstration purposes only and has
            not been verified.
        </p>
    </div>
</div>

<div
    class="px-4 md:px-6 py-6 min-h-screen overflow-hidden font-sans"
    style="background: linear-gradient(to bottom, #fb923c 0%, #fdba74 15%, #93c5fd 150%, #60a5fa 100%);"
>
    <div class="z-10 relative space-y-5 mx-auto max-w-7xl">
        <header class="space-y-3 text-center">
            <h1
                class="font-display font-bold text-gray-900 text-5xl tracking-tight"
            >
                2025 UK Policy Tracker
            </h1>
            <p
                class="mx-auto max-w-2xl font-light text-gray-600 text-lg leading-relaxed"
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

        <!-- Topic Tabs (Desktop) / Dropdown (Mobile) -->
        <div class="flex justify-center">
            <!-- Mobile Dropdown -->
            <div class="md:hidden w-full max-w-xs">
                <select
                    class="bg-white shadow-sm px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full font-medium text-gray-700 text-sm"
                    bind:value={activeTopic}
                >
                    {#each Object.entries(topics) as [topicKey, topicData]}
                        <option value={topicKey}>
                            {topicData.title}
                        </option>
                    {/each}
                </select>
            </div>

            <!-- Desktop Tabs -->
            <div
                class="hidden md:inline-flex bg-white shadow-sm p-1 border border-gray-200 rounded-lg"
            >
                {#each Object.entries(topics) as [topicKey, topicData]}
                    {@const isActive = activeTopic === topicKey}
                    <button
                        class="px-6 py-2 rounded-md font-medium text-sm transition-all duration-200 {isActive ? topicData.colors.bg + ' text-white' : 'text-gray-700 ' + topicData.colors.hover}"
                        onclick={() => (activeTopic = topicKey as Topic)}
                    >
                        {topicData.title}
                    </button>
                {/each}
            </div>
        </div>

        <main>
            <!-- Criterion Selector -->
            <div class="flex justify-center mb-4">
                <div
                    class="inline-flex bg-white shadow-sm p-1 border rounded-lg {topics[activeTopic].colors.border}"
                >
                    {#each topics[activeTopic].criteria as criterion}
                        {@const isActive = activeCriterion === criterion}
                        <button
                            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 {isActive ? topics[activeTopic].colors.bg + ' text-white' : 'text-gray-700 ' + topics[activeTopic].colors.hover}"
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
                        title={topics[activeTopic].title}
                        criterionLabel={topics[activeTopic].criteriaLabels[activeCriterion]}
                    />
                {:else if hasData}
                    <div
                        class="bg-white shadow-sm p-12 border border-gray-200 rounded-xl text-center"
                    >
                        <svg
                            class="mx-auto mb-4 w-16 h-16 text-amber-400"
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
                        <h3 class="mb-2 font-semibold text-gray-900 text-xl">
                            No Scores for "{topics[activeTopic].criteriaLabels[
                                activeCriterion
                            ]}"
                        </h3>
                        <p class="mb-4 text-gray-600">
                            Policies exist for {topics[
                                activeTopic
                            ].title.toLowerCase()}, but they haven't been scored
                            for this criterion yet.
                        </p>
                    </div>
                {:else}
                    <div
                        class="bg-white shadow-sm p-12 border border-gray-200 rounded-xl text-center"
                    >
                        <svg
                            class="mx-auto mb-4 w-16 h-16 text-gray-400"
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
                        <h3 class="mb-2 font-semibold text-gray-900 text-xl">
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
            <div class="isolate relative">
                <!-- Ground Layer (Breakout Background) -->
                <div
                    class="bottom-0 left-1/2 -z-10 absolute w-screen h-[10000px] -translate-x-1/2 translate-y-[calc(100%-150px)] pointer-events-none"
                >
                    <GroundLayer />
                </div>

                {@render policyChartOrEmpty()}
            </div>

            <!-- Methodology Section (Collapsible) -->
            <div
                class="z-10 relative bg-white shadow-sm mt-6 border border-gray-200 rounded-xl overflow-hidden"
            >
                <button
                    class="flex justify-between items-center hover:bg-gray-50 px-6 py-4 w-full transition-colors"
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
                        <h3 class="font-semibold text-gray-900 text-lg">
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
                    <div class="space-y-6 px-6 pb-6 text-gray-700">
                        <!-- Overview -->
                        <div>
                            <h4 class="mb-2 font-semibold text-gray-900">
                                Overview
                            </h4>
                            <p class="text-sm leading-relaxed">
                                This tracker uses AI-powered analysis to score
                                UK political party policies across multiple
                                dimensions. Each policy is evaluated by Google's
                                Gemini 2.5 Flash model using structured prompts
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

                        <!-- Scoring Criteria for Active Criterion -->
                        <div>
                            <div class="space-y-4">
                                {#each [activeCriterion] as criterion}
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
                                    {@const index = Math.max(0, TOPIC_CONFIGS[activeTopic].criteria.indexOf(criterion))}
                                    {@const color = colors[index % colors.length]}
                                    {#if color && topics[activeTopic].criteriaLabels[criterion] && TOPIC_CONFIGS[activeTopic].prompts[criterion]}
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
                                            <Markdown
                                                content={TOPIC_CONFIGS[activeTopic].prompts[
                                                    criterion
                                                ]}
                                                class="text-xs leading-relaxed {color.text.replace('text-', 'prose-')}"
                                            />
                                        </div>
                                    {/if}
                                {/each}
                            </div>
                        </div>

                        <!-- AI Analysis -->
                        <div>
                            <h4 class="mb-2 font-semibold text-gray-900">
                                AI-Powered Analysis
                            </h4>
                            <p class="text-sm leading-relaxed">
                                Each policy is analyzed by Google's Gemini 2.5
                                Flash model, which provides:
                            </p>
                            <ul class="space-y-1 mt-2 ml-4 text-sm list-disc">
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
                            class="bg-amber-50 p-4 border border-amber-200 rounded-lg"
                        >
                            <h4
                                class="flex items-center gap-2 mb-2 font-semibold text-amber-900"
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
            class="z-10 relative pt-8 border-gray-200 border-t text-white text-sm text-center"
        >
    An experimental project by <a href="https://github.com/dldx" class="hover:underline" target="_blank" >Durand D'souza</a>. Data and scores have not yet been verified. View the source on <a href="https://github.com/dldx/uk-policy-thermometer" target="_blank" class="hover:underline">GitHub</a>.
    </footer>
    </div>
</div>
