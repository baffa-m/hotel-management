<script>
    import axios from 'axios'
    import { onMount } from 'svelte';
    import RoomType from './RoomType.svelte';
    import MiniCard from './shared/MiniCard.svelte'
    import Button from './shared/Button.svelte'
    import { createEventDispatcher } from 'svelte'
import { get } from 'svelte/store';


    const dispatch = createEventDispatcher()

    
    $: roomTypes = ''
    $: rooms = ''
    $: room_select = ''
    let errMsg = ''

    onMount(async () => {
        const res = await fetch('https://ghwtjp.deta.dev/room-type/')
        roomTypes = await res.json()
        console.log(roomTypes)
    })

    onMount(async () => {
        const res = await fetch('https://ghwtjp.deta.dev/room/')
        rooms = await res.json()
        console.log(rooms)
           
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
        <select bind:value={room_select}>
            <option>--- Select Room Type ---</option>
            {#each roomTypes as roomType (roomType.id)}
                <option value={roomType.id}>{roomType.room_type}</option>
            {/each}
        </select>
        
        </div>
        {#each rooms as room (room.id)}
            {#if room.available}
            {#if room.room_typeid == room_select}
            <div on:click={formHandler(room.id, room.room_type.cost)} class="card mb-3" style="max-width: 540px;" >
                <div class="row g-0">
                <div class="col-md-4">
                    <img src="..." class="img-fluid rounded-start" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                    <h5 class="card-title">Room {room.room_name}</h5>
                    <p class="card-text">{room.room_type.description}</p>
                    <p class="card-text"><b>₦{room.room_type.cost}/day</b></p>
                    </div>
                </div>
                </div>
            </div>
            {/if}
            {/if}
        {/each}
</main>
<style>
    
</style>