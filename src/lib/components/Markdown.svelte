<script lang="ts">
    import { marked } from "marked";

    let { content, class: className = "" }: { content?: string; class?: string } = $props();

    const html = $derived(content ? marked(content, { breaks: true, gfm: true }) : "");
</script>

{#if html}
    <div class="markdown {className}">
        {@html html}
    </div>
{/if}

<style>
    .markdown :global(p) {
        margin-bottom: 0.75em;
    }

    .markdown :global(p:last-child) {
        margin-bottom: 0;
    }

    .markdown :global(strong) {
        font-weight: 600;
    }

    .markdown :global(em) {
        font-style: italic;
    }

    .markdown :global(ul) {
        list-style-type: disc;
        margin-left: 1.5em;
        margin-bottom: 0.75em;
    }

    .markdown :global(ol) {
        list-style-type: decimal;
        margin-left: 1.5em;
        margin-bottom: 0.75em;
    }

    .markdown :global(li) {
        margin-bottom: 0.25em;
    }

    .markdown :global(code) {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 0.125em 0.25em;
        border-radius: 0.25em;
        font-family: ui-monospace, monospace;
        font-size: 0.9em;
    }

    .markdown :global(pre) {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 0.75em;
        border-radius: 0.5em;
        overflow-x: auto;
        margin-bottom: 0.75em;
    }

    .markdown :global(pre code) {
        background-color: transparent;
        padding: 0;
    }

    .markdown :global(a) {
        color: #2563eb;
        text-decoration: underline;
    }

    .markdown :global(a:hover) {
        color: #1d4ed8;
    }

    .markdown :global(h1),
    .markdown :global(h2),
    .markdown :global(h3),
    .markdown :global(h4),
    .markdown :global(h5),
    .markdown :global(h6) {
        font-weight: 600;
        margin-top: 1em;
        margin-bottom: 0.5em;
    }

    .markdown :global(h1) {
        font-size: 1.5em;
    }

    .markdown :global(h2) {
        font-size: 1.25em;
    }

    .markdown :global(h3) {
        font-size: 1.125em;
    }

    .markdown :global(blockquote) {
        border-left: 3px solid #e5e7eb;
        padding-left: 1em;
        margin-left: 0;
        margin-bottom: 0.75em;
        color: #6b7280;
    }
</style>
