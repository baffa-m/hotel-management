<script>
import { onMount } from 'svelte'

let rooms = [] 

onMount(async () => {
    const res = await fetch('http://localhost:8000/room/')
    rooms = await res.json()
    console.log(rooms)
})

</script>

<main>
    <table>
        <thead>
            <tr>
                <th>id</th>
                <th>Room Name</th>
                <th>Room Type</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each rooms as room}
                <tr>
                    <td>{room.id}</td>
                    <td>{room.room_name}</td>
                    <td>{room.room_type.room_type}</td>
                    <td></td>
                    <td>
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-primary-red" on:click|preventDefault={() => deleteRoom(room.id)}>Checkout</button>
                          </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
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