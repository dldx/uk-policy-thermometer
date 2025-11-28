<div
    class="relative w-full h-full flex flex-col justify-end pointer-events-none"
>
    <!-- Tiled Ground Layer -->
    <div
        class="w-full h-[800px] bg-repeat-x bg-bottom"
        style="background-image: url('/ground.svg'); background-size: auto 100%;"
    ></div>

    <!-- Extended bedrock -->
    <div class="w-full grow relative -mt-20">
        <div class="absolute inset-0 bg-[#4d4d47]" style="top: 10%"></div>
        <!-- Bedrock Pattern -->
        <div
            class="absolute inset-0 bg-repeat bg-transparent"
            style="background-image: url('/bedrock.svg'); background-position: -20% 0%;"
        ></div>
    </div>
</div>
