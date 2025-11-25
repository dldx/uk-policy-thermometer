<script lang="ts">
    import { Plot, Dot, Line, RegressionY, HTMLTooltip } from "svelteplot";
    import { weightedLoess } from "../utils";

    interface Policy {
        date_announced: string;
        raw_human_rights_score: number;
        policy_text: string;
        weight: number;
        reasoning?: string;
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

    let { data }: { data: Party[] } = $props();

    // State for toggling parties
    let visibleParties = $state(new Set(data.map((d) => d.party_name)));

    // State for locked tooltip (for click-to-persist behavior)
    let lockedTooltip = $state<Policy | null>(null);

    // State for hovered party
    let hoveredParty = $state<string | null>(null);

    let clickTimeout: ReturnType<typeof setTimeout> | null = null;

    function handlePartyClick(partyName: string) {
        if (clickTimeout) clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            toggleParty(partyName);
            clickTimeout = null;
        }, 250);
    }

    function handlePartyDoubleClick(partyName: string) {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        isolateParty(partyName);
    }

    function toggleParty(partyName: string) {
        if (visibleParties.has(partyName)) {
            visibleParties.delete(partyName);
        } else {
            visibleParties.add(partyName);
        }
        // Trigger reactivity for set
        visibleParties = new Set(visibleParties);
    }

    function isolateParty(partyName: string) {
        if (visibleParties.size === 1 && visibleParties.has(partyName)) {
            visibleParties = new Set(data.map((d) => d.party_name));
        } else {
            visibleParties = new Set([partyName]);
        }
    }

    // Flatten all policies with party info for SveltePlot
    let allPolicies = $derived(
        data
            .filter((party) => visibleParties.has(party.party_name))
            .flatMap((party) =>
                party.policies.map((policy) => ({
                    ...policy,
                    party_name: party.party_name,
                    party_color: party.color,
                    date: new Date(policy.date_announced),
                })),
            ),
    );

    function handlePolicyClick(
        policy: Policy & {
            party_name: string;
            party_color: string;
            date: Date;
        },
    ) {
        if (lockedTooltip === policy) {
            lockedTooltip = null;
        } else {
            lockedTooltip = policy;
        }
    }

    function tooltipPosition(node: HTMLElement, _datum: any) {
        const updatePosition = () => {
            const parentRect = node.parentElement?.getBoundingClientRect();
            if (!parentRect) return;

            const { width, height } = node.getBoundingClientRect();
            const { top: anchorY, left: anchorX } = parentRect;

            let translateX = "-100%";
            let translateY = "-100%";
            let marginTop = "-10px";
            let marginLeft = "-10px";

            // Check top overflow
            if (anchorY - height - 20 < 0) {
                translateY = "0%";
                marginTop = "10px";
            }

            // Check left overflow
            if (anchorX - width - 20 < 0) {
                translateX = "0%";
                marginLeft = "10px";
            }

            node.style.transform = `translate(${translateX}, ${translateY})`;
            node.style.marginTop = marginTop;
            node.style.marginLeft = marginLeft;
        };

        updatePosition();

        return {
            update() {
                updatePosition();
            },
        };
    }
</script>

<div class="flex flex-col gap-4 relative">
    <!-- Legend -->
    <div
        class="flex flex-wrap gap-4 justify-center p-4 bg-gray-50 rounded-lg border border-gray-200"
    >
        {#each data as party}
            <button
                class="flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 border"
                style:background-color={visibleParties.has(party.party_name)
                    ? party.color + "20"
                    : "transparent"}
                style:border-color={party.color}
                style:opacity={visibleParties.has(party.party_name) ? 1 : 0.5}
                onclick={() => handlePartyClick(party.party_name)}
                ondblclick={() => handlePartyDoubleClick(party.party_name)}
            >
                <span
                    class="w-3 h-3 rounded-full"
                    style:background-color={party.color}
                ></span>
                <span class="font-medium text-sm text-gray-800"
                    >{party.party_name}</span
                >
            </button>
        {/each}
    </div>

    <!-- Chart Container -->
    <div
        class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative chart-container"
    >
        <Plot
            height={600}
            x={{
                domain: [new Date("2021-01-01"), new Date("2025-12-31")],
                grid: true,
            }}
            y={{
                domain: [0, 10],
                grid: true,
            }}
            marginLeft={50}
            marginRight={30}
            marginTop={20}
            marginBottom={40}
        >
            <!-- Weighted LOESS Regression Lines for each party -->
            {#each data.filter( (p) => visibleParties.has(p.party_name), ) as party}
                {@const loessData = weightedLoess(
                    party.policies.map((p) => ({
                        x: new Date(p.date_announced).getTime(),
                        y: p.raw_human_rights_score,
                        w: 2 ** p.weight, // Use exponential weight to make important policies count more
                    })),
                    0.2,
                ).map((d) => ({ date: new Date(d.x), score: d.y }))}
                <Line
                    data={loessData}
                    x="date"
                    y="score"
                    stroke={party.color}
                    strokeWidth={hoveredParty === party.party_name ? 5 : 4}
                    strokeOpacity={hoveredParty &&
                    hoveredParty !== party.party_name
                        ? 0.1
                        : 1}
                    onpointerenter={() => (hoveredParty = party.party_name)}
                    onpointerleave={() => (hoveredParty = null)}
                    curve="basis"
                />
                <!-- <RegressionY
                    data={party.policies.map((p) => ({
                        date: new Date(p.date_announced),
                        score: p.raw_human_rights_score,
                    }))}
                    type="loess"
                    span={0.25}
                    x="date"
                    y="score"
                    stroke={"grey"}
                    strokeWidth={hoveredParty === party.party_name ? 5 : 4}
                    strokeOpacity={hoveredParty &&
                    hoveredParty !== party.party_name
                        ? 0.1
                        : 1}
                    onpointerenter={() => (hoveredParty = party.party_name)}
                    onpointerleave={() => (hoveredParty = null)}
                    curve="basis"
                /> -->

                <!-- Data Points -->
                <Dot
                    data={party.policies}
                    x={(d: Policy) => new Date(d.date_announced)}
                    y={(d: Policy) => d.raw_human_rights_score}
                    r={(d: Policy) => 2 ** d.weight + 2}
                    fill={party.color}
                    opacity={hoveredParty
                        ? hoveredParty === party.party_name
                            ? 0.5 // hover opacity of selected party
                            : 0.05 // hover opacity of other parties
                        : 0.2}
                />
            {/each}

            <!-- Tooltips -->
            {#snippet overlay()}
                <HTMLTooltip
                    data={allPolicies}
                    x="date"
                    y="raw_human_rights_score"
                >
                    {#snippet children({ datum })}
                        <div
                            class="tooltip-content max-w-md cursor-pointer"
                            use:tooltipPosition={datum}
                            onclick={(e) => {
                                e.stopPropagation();
                                handlePolicyClick(datum);
                            }}
                        >
                            <!-- Header with date and score -->
                            <div
                                class="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-200"
                            >
                                <div class="flex items-center gap-2">
                                    <span
                                        class="w-3 h-3 rounded-full"
                                        style:background-color={datum.party_color}
                                    ></span>
                                    <span class="font-semibold text-gray-900"
                                        >{datum.party_name}</span
                                    >
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-gray-600"
                                        >{datum.date_announced}</span
                                    >
                                    <span
                                        class="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                        style:background-color={datum.party_color}
                                    >
                                        {datum.raw_human_rights_score}/10
                                    </span>
                                </div>
                            </div>

                            <!-- Policy text -->
                            <p
                                class="font-medium text-gray-900 mb-3 leading-relaxed"
                            >
                                {datum.policy_text}
                            </p>

                            <!-- Weight indicator -->
                            <div class="flex items-center gap-2 mb-3">
                                <span
                                    class="text-xs font-semibold text-gray-600"
                                    >Impact Weight:</span
                                >
                                <div class="flex gap-1">
                                    {#each Array(3) as _, i}
                                        <div
                                            class="w-2 h-2 rounded-full"
                                            class:bg-gray-300={i >=
                                                datum.weight}
                                            style:background-color={i <
                                            datum.weight
                                                ? datum.party_color
                                                : undefined}
                                        ></div>
                                    {/each}
                                </div>
                                <span class="text-xs text-gray-500"
                                    >({datum.weight}/3)</span
                                >
                            </div>

                            <!-- AI Analysis -->
                            {#if datum.reasoning}
                                <div
                                    class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3"
                                >
                                    <div class="flex items-center gap-1 mb-1.5">
                                        <svg
                                            class="w-4 h-4 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            />
                                        </svg>
                                        <span
                                            class="font-semibold text-gray-800"
                                            >AI Analysis</span
                                        >
                                    </div>
                                    <p class="text-xs leading-relaxed">
                                        {datum.reasoning}
                                    </p>
                                </div>
                            {/if}

                            <!-- Source information -->
                            {#if datum.source}
                                <div
                                    class="text-xs bg-blue-50 p-2.5 rounded-lg border border-blue-100"
                                >
                                    <div
                                        class="font-semibold text-blue-900 mb-1"
                                    >
                                        Source
                                    </div>
                                    {#if datum.source.url}
                                        <a
                                            href={datum.source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="text-blue-600 hover:text-blue-800 underline break-all block mb-1.5"
                                            onclick={(e) => e.stopPropagation()}
                                        >
                                            {datum.source.url}
                                        </a>
                                    {/if}
                                    {#if datum.source.notes}
                                        <p
                                            class="text-gray-700 leading-relaxed"
                                        >
                                            {datum.source.notes}
                                        </p>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/snippet}
                </HTMLTooltip>
            {/snippet}
        </Plot>
    </div>
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

    /* Smooth transitions for chart elements */
    :global(.chart-container path),
    :global(.chart-container circle) {
        transition:
            opacity 0.5s ease,
            stroke-opacity 0.5s ease,
            stroke-width 0.5s ease;
    }
</style>
