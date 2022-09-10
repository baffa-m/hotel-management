<script>
import axios from 'axios';
import { onMount } from 'svelte'
import { DoubleBounce } from 'svelte-loading-spinners'
import Button from './shared/Button.svelte'

let rooms = [] 

onMount(async () => {
    const res = await fetch('https://ghwtjp.deta.dev/room/')
    rooms = await res.json()
    console.log(rooms)
    
})

const checkOutRoom = async (id) => {
    try {
        await axios.patch('https://ghwtjp.deta.dev/room/', {available:0})
    } catch(e) {
        console.log(e)
    }
}

const checkInRoom = async (id) => {
    try {
        await axios.patch('https://ghwtjp.deta.dev/room/', {available:1})
        await axios.patch
    } catch(e) {
        console.log(e)
    }
}

</script>

<main>
    {#await rooms}
    <DoubleBounce size="60" color="#FF3E00" unit="px" duration="1s"></DoubleBounce>
    {:then rooms}
    <table>
        <thead>
            <tr>
                <th>id</th>
                <th>Room Name</th>
                <th>Room Type</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Check-Out</th>
            </tr>
        </thead>
        <tbody>
            {#each rooms as room}
                <tr>
                    <td>{room.id}</td>
                    <td>{room.room_name}</td>
                    <td>{room.room_type.room_type}</td>
                    <td>
                        {#if !room.available}
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <Button inverse>Booked</Button>
                        </div>
                        {:else}
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <Button inverse>Available</Button>
                        </div>
                        {/if}
                    </td>
                    <td>
                        {#if !room.available && !room.checked}
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-primary-red" on:click|preventDefault={() => checkOutRoom(room.id)}>Check-in</button>
                        </div>
                        {/if}
                    </td>
                    <td>
                        {#if room.checked}
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-primary-red" on:click|preventDefault={() => checkOutRoom(room.id)}>Checkout</button>
                        </div>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    {/await}
    
    </main>
    
    <style>
    table{
        width: max-content;
        text-align: center;
        border: 1px solid;
    }
    th, td{
        text-align: center;
        border: 1px solid;
    }
    
    .btn-primary-red{
        background: red;
    }
    .btn{
        size: 5cm;
    }
    </style>