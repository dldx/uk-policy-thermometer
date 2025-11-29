<script lang="ts">
    import Markdown from "./Markdown.svelte";

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

    interface TweenedPolicy extends Policy {
        party_name: string;
        party_color: string;
        date: Date;
        tweenedScore: number;
        tweenedWeight: number;
    }

    let {
        datum,
        criterion,
        onPolicyClick,
    }: {
        datum: TweenedPolicy;
        criterion: string;
        onPolicyClick: (policy: TweenedPolicy) => void;
    } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="relative max-w-lg tooltip-content"
>
    <!-- Close button -->
    <button
        class="top-2 right-2 absolute flex justify-center items-center hover:bg-gray-200 rounded-full w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors"
        onclick={(e) => {
            e.stopPropagation();
            onPolicyClick(datum);
        }}
        aria-label="Close tooltip"
    >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>

    <!-- Header: Party and Date -->
    <div class="flex justify-between items-start gap-3 mb-3 pr-6">
        <div class="flex items-center gap-2">
            <span
                class="flex-shrink-0 rounded-full w-3 h-3"
                style:background-color={datum.party_color}
            ></span>
            <span class="font-bold text-gray-900 text-base"
                >{datum.party_name}</span
            >
        </div>
        <span class="text-gray-500 text-sm whitespace-nowrap"
            >{new Date(datum.date_announced).toLocaleDateString("en-GB",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }
            )}</span
        >
    </div>

    <!-- Policy text -->
    <div
        class="bg-gray-50 mb-4 p-3 border border-gray-200 rounded-lg"
    >
        <p
            class="font-medium text-gray-900 text-sm leading-relaxed"
        >
            <Markdown content={datum.policy_text}></Markdown>
        </p>
    </div>

    <!-- Score and Weight Card -->
    {#if datum.scores?.[criterion]}
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 mb-4 p-4 border border-blue-200 rounded-lg">
            <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2">
                    <svg
                        class="flex-shrink-0 w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                    <span
                        class="font-bold text-blue-900 text-sm uppercase tracking-wide"
                        >Score justification</span
                    >
                </div>
                <div class="flex items-center gap-3">
                    <!-- Weight indicator -->
                    <div class="flex items-center gap-1.5">
                        <span class="font-medium text-gray-600 text-xs">Weight:</span>
                        <div class="flex gap-1">
                            {#each Array(3) as _, i}
                                <div
                                    class="rounded-full w-2.5 h-2.5"
                                    class:bg-gray-300={i >= datum.scores[criterion].weight}
                                    style:background-color={i < datum.scores[criterion].weight
                                        ? datum.party_color
                                        : undefined}
                                ></div>
                            {/each}
                        </div>
                    </div>
                    <!-- Score badge -->
                    <div
                        class="shadow-md px-3 py-1.5 rounded-full font-bold text-white text-lg"
                        style:background-color={datum.party_color}
                    >
                        {datum.scores[criterion].score}<span class="opacity-90 text-sm">/10</span>
                    </div>
                </div>
            </div>
            <!-- Reasoning -->
            <div class="pt-3 border-gray-300 border-t">
                <p class="text-blue-900 text-xs leading-relaxed">
                    {datum.scores[criterion].reasoning}
                </p>
            </div>
        </div>
    {/if}

    <!-- Source information -->
    {#if datum.source && (datum.source.url || datum.source.notes)}
        <details class="group">
            <summary class="flex items-center gap-2 bg-gray-100 hover:bg-gray-150 px-3 py-2 border border-gray-200 rounded-lg font-semibold text-gray-700 text-xs transition-colors cursor-pointer">
                <svg
                    class="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
                View Source
            </summary>
            <div class="bg-gray-50 mt-2 p-3 border border-gray-200 rounded-lg text-xs">
                {#if datum.source.url}
                    <a
                        href={datum.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-1.5 mb-2 font-medium text-blue-600 hover:text-blue-800 underline break-all"
                    >
                        <svg class="flex-shrink-0 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {datum.source.url}
                    </a>
                {/if}
                {#if datum.source.notes}
                    <p class="text-gray-700 leading-relaxed">
                        {datum.source.notes}
                    </p>
                {/if}
            </div>
        </details>
    {/if}
</div>

<style>
    :global(.tooltip-content) {
        background: white;
        border: 1px solid #e5e7eb;
        font-size: 14px;
        padding: 16px;
        border-radius: 12px;
        line-height: 1.5;
        box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        max-width: 28rem;
        pointer-events: auto;
    }

    :global(.tooltip-content a) {
        word-break: break-word;
    }
</style>
