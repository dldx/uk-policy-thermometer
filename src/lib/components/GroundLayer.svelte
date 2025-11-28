<div
    class="relative flex flex-col justify-end w-full h-full pointer-events-none"
>
    <!-- Tiled Ground Layer -->
    <div
        class="bg-repeat-x bg-bottom w-full h-[400px] sm:h-[600px] md:h-[800px]"
        style="background-image: url('/ground.svg'); background-size: auto 100%;"
    ></div>

    <!-- Extended bedrock -->
    <div class="relative -mt-20 w-full grow">
        <div class="top-10 absolute inset-0 bg-[#656760]"></div>
        <!-- Bedrock Pattern -->
        <div
            class="absolute inset-0 bg-[url('/bedrock.svg')] bg-position-[20%_0%] sm:bg-position-[-20%_0%] bg-repeat bg-size-[120%_auto] sm:bg-size-[auto_auto]"
        ></div>
    </div>
</div>
