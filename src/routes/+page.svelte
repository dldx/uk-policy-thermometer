<script lang="ts">
    import PolicyChart from "$lib/components/PolicyChart.svelte";
    import policies from "$lib/data/policies.json";
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
                2025 Migration Policy <br />
                <span class="text-gray-700 italic">Human Rights Tracker</span>
            </h1>
            <p
                class="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed"
            >
                Tracking the human rights impact of UK political party migration
                policies throughout 2025. Scores range from <span
                    class="font-semibold text-red-600">1 (Severe Harm)</span
                >
                to
                <span class="font-semibold text-green-600"
                    >10 (Substantial Improvement)</span
                >.
            </p>
        </header>

        <main>
            <PolicyChart data={policies} />
        </main>

        <footer
            class="text-center text-sm text-gray-500 pt-8 border-t border-gray-200"
        >
            <p>Data visualization powered by D3.js and SvelteKit.</p>
        </footer>
    </div>
</div>
