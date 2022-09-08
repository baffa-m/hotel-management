<script>
    import { onMount } from 'svelte'
    import axios from 'axios'
    import AddRoom from './AddRoom.svelte';
    import RoomList from './RoomList.svelte';
    import Button from "./shared/Button.svelte";
    
    let halls = []
    let errMsg = ''

    onMount(async () => {
        const res = await fetch('https://ghwtjp.deta.dev/hall/')
        halls = await res.json()
        console.log(halls)
    })

    const deleteHall = async (id) => {
        try {
            await axios.delete(`https://ghwtjp.deta.dev/hall/${id}/`)
            halls = halls.filter((hall) => hall.id !== id)
            
        } catch (e) {
            errMsg = e
        }
    }
    
    
    </script>
    
    
    <main>
    <table>
        <thead>
            <tr>
                <th>id</th>
                <th>Hall Name</th>
                <th>Seats</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each halls as hall (hall.id)}
                <tr>
                    <td>{hall.id}</td>
                    <td>{hall.hall_name}</td>
                    <td>{hall.seats}</td>
                    <td>
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-primary-red" on:click={() => deleteHall(hall.id)}>Delete</button>
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