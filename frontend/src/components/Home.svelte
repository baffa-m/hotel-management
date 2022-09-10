<script>
import MiniCard from "./shared/MiniCard.svelte";
import { onMount } from "svelte"


let rooms = []
let bookedrooms = []
let freerooms = []
onMount(async () => {
    const res = await fetch('https://ghwtjp.deta.dev/room/')
    rooms = await res.json()
    console.log(rooms)
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].available == false) {
            bookedrooms = [...bookedrooms, rooms[i]]
        }
        else {
            freerooms = [...freerooms, rooms[i]]
        }
    }
    console.log(bookedrooms)
    
})


</script>

<div class="main">
    <div>
        <MiniCard>
            <h1>{rooms.length}</h1>
            <p>Active Rooms</p>
        </MiniCard>
    </div>
    <div>
        <MiniCard>
            <h1>{bookedrooms.length}</h1>
            <p>Booked Rooms</p>
        </MiniCard>
    </div>
    <div>
        <MiniCard>
            <h1>{freerooms.length}</h1>
            <p>Available Rooms</p>
        </MiniCard>
    </div>
</div>

<style>
    .main {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 8px;
	}

</style>