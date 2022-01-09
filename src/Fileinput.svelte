<script lang="ts">
import { createEventDispatcher } from "svelte";


    export let src: string = null;
    export let file: File = null;

    const dispatch = createEventDispatcher();

    function didChooseFile(e) {
        if (e.target.files[0]) {
            file = e.target.files[0];
            src = URL.createObjectURL(file);
            dispatch("change", {
                src: src,
                file: file
            });
        }
    }
</script>

<label class="knapp">
    <input type="file" accept="image/png,image/jpeg" on:change={didChooseFile}/>
    <i class="material-icons-round">qr_code</i>
    Vel fil
</label>

<style>

input[type="file"] {
    display: none;
}

</style>