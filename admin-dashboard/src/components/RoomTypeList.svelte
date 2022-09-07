<script>
import {onMount} from 'svelte'
import { writable } from 'svelte/store';
import Modal from 'svelte-simple-modal';
import Popup from './Popup.svelte';


    const modal = writable(null);
    let getId 
    const showModal = (id) => {
        getId = id
        console.log(getId)
        modal.set(Popup)
    }

    $: roomtypes = []

    onMount(async () => {
        const res = await fetch('https://ghwtjp.deta.dev/room-type/')
        roomtypes = await res.json()
        console.log(roomtypes)
    })


    const deleteRoom = async (id) => {
        const res = await fetch(`https://ghwtjp.deta.dev/room-type/${id}/`, {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json"
            }
        })
        roomtypes = roomtypes.filter((room) => room.id !== id)
    }

    /*const updateRoom = async (id) => {
        console.log(id)
        const res = await fetch(`http://localhost:8000/room-type/${id}/`, {
            method: 'PATCH',
            headers: {
                "Content-type": "application/json"
            },
            body: {postData}
            
        })
        const json = await res.json()
        result = JSON.stringify(json)
        console.log(postData)
    } */
</script>
<Modal show={$modal}>
</Modal>

<table>
    <thead>
        <tr>
            <th>id</th>
            <th>Room Type</th>
            <th>Description</th>
            <th>Cost</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each roomtypes as roomtype (roomtype.id)}
            <tr>
                <td>{roomtype.id}</td>
                <td>{roomtype.room_type}</td>
                <td>{roomtype.description}</td>
                <td>{roomtype.cost}</td>
                <td>
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button type="button" class="btn btn-primary" on:click={showModal(roomtype.id)} >Edit</button>
                        <button type="button" class="btn btn-primary-red" on:click|preventDefault={() => deleteRoom(roomtype.id)}>Delete</button>
                      </div>
                </td>
            </tr>
        {/each}
    </tbody>
</table>



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
    .but{
        text-align: right;
    }
    .btn-primary-red{
        background: red;
    }
    .btn{
        size: 5cm;
    }
</style>