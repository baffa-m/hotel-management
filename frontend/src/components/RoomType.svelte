<script>
    import {onMount} from 'svelte'
    import { fade } from 'svelte/transition'
    import RoomTypeForm from './RoomTypeForm.svelte';
import RoomTypeList from './RoomTypeList.svelte';
    import Button from "./shared/Button.svelte";
    import Card from './shared/Card.svelte';

    export let activeTab = RoomTypeList

    
</script> 
<main>
    <div class="butttons">
        <button on:click={() => (activeTab = RoomTypeForm)}>Add Type</button>
        <button on:click={() => (activeTab = RoomTypeList)}>View</button>
    </div>
    <br>
    <br>
    <svelte:component this={activeTab} />  
</main>
    
<style>
    .butttons{
        text-align: right;
    }
</style>