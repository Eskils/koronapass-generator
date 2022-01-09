<script lang="ts">
import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    export let shouldLoad: boolean = false;
    export let disabled: boolean;


    function action() { 
        dispatch("click"); 
    }

</script>

<style>

    @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
    }

    @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
    }

    .spinner {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: transparent;
        border: solid 2px white;
        border-top-color: transparent;
        -webkit-animation: spin 1s linear infinite;
        animation: spin 1s linear infinite;
    }

</style>

<button on:click={action} class="knapp" disabled={disabled}>

{#if !shouldLoad}
<slot></slot>
{:else}
<div class="spinner"></div>
{/if}

</button>