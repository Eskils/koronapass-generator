<script lang="ts">
    export let steg: number = null;
    export let tittel: string = null;
</script>

<style>

    .container {
        background: var(--cell);
        border-radius: 8px;
        box-shadow: 0px 0px 20px 2px rgba(0,0,0, 0.01);
        padding: 12px;
        margin-bottom: 12px;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    }

    .stegContainer {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .stegContainer>div {
        border-radius: 50%;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        box-shadow: 0px 0px 20px 2px rgba(0,0,0, 0.01);
        height: 30px;
        margin-right: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--border);;
    }

    .stegContainer>h3 {
        margin: 0;
        font-size: 1em;
    }

    .stegContainer>div>p {
        font-size: 1.2em;
        font-weight: bold;
        margin: 0;
    }

</style>

<div class="container">
    {#if steg && tittel}
    <div class="stegContainer">
        <div>
            <p>{steg}</p>
        </div>
        <h3>{tittel}</h3>
    </div>
    {/if}
    <slot/>
</div>