<script>
import AddHall from "./AddHall.svelte";

import HallList from "./HallList.svelte"; 
    
    let activeTab = HallList
</script>

<div class="butttons">
    <button on:click={() => (activeTab = AddHall)}>Add Hall</button>
    <button on:click={() => (activeTab = HallList)}>View</button>
</div>
<br>
<br>
<svelte:component this={activeTab} />

    
    