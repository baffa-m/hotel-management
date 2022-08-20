<script>
import AddRoom from './AddRoom.svelte';
import RoomList from './RoomList.svelte';


let activeTab = RoomList

</script>

<main>
    <div class="butttons">
        <button on:click={() => (activeTab = AddRoom)}>Add Room</button>
        <button on:click={() => (activeTab = RoomList)}>View</button>
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