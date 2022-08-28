<script>
    import axios from 'axios'
    import { onMount } from 'svelte';
import RoomType from '../../../admin-dashboard/src/components/RoomType.svelte';
    import MiniCard from './shared/MiniCard.svelte'
    import Button from './shared/Button.svelte'
    import { createEventDispatcher } from 'svelte'


    const dispatch = createEventDispatcher()

    
    $: roomTypes = ''
    let errMsg = ''

    onMount(async () => {
        const res = await fetch('http://localhost:8000/room/')
        roomTypes = await res.json()
        console.log(roomTypes)
    })

    let roomInfo = {id: '', price: ''}
    const formHandler = (id, price) => {
        roomInfo.id = id
        roomInfo.price = price
        console.log(roomInfo)
        dispatch('add', roomInfo)

    }
</script>
<!--
<main>
    {#each roomTypes as roomType (roomType.id)}
    <div class="main">
        <MiniCard>
            <h3>{roomType.room_type}</h3>
            <p>{roomType.description}</p>
            <p><b>₦{roomType.cost}/day</b></p>
            <p>{roomType.id}</p>
            <Button inverse on:click={formHandler(roomType.id)}>Select</Button>
        </MiniCard>
    </div>
    {/each}
</main>
-->
<main>
    <div class="container text-center">
        <div class="row row-cols-3">
            {#each roomTypes as roomType (roomType.id)}
            <div class="col">
                <h3>{roomType.room_type.room_type}</h3>
                <p>Room Type</p>
                <h5>Room {roomType.room_name}</h5>
                <p>{roomType.description}</p>
                <p><b>₦{roomType.room_type.cost}/day</b></p>
                <Button inverse on:click={formHandler(roomType.id, roomType.room_type.cost)}>Select</Button>
            </div>
            {/each}          
        </div>
      </div>
</main>
<style>
    .main {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 8px;
	}
</style>