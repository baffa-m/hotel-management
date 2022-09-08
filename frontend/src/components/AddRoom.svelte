<script>
    import Button from "./shared/Button.svelte";
    import {onMount} from "svelte"
    
    let postData = {
        room_name: '',
        room_typeid: '',
        available: 1
    }
    let valid = false
    let errors = {room_name: '', room_type: ''};
    let result = null

    let roomTypes = []

    onMount(async () => {
        const res = await fetch('http://localhost:8000/room-type/')
        roomTypes = await res.json()
        console.log(roomTypes)
    })
    
    
    const formHandler = async () => {  
    
        const res = await fetch('http://localhost:8000/room/', {
            method: 'POST',
            headers : { "content-type" : "application/json"},
            body: JSON.stringify(postData)
    
        })
        const json = await res.json()
        result = JSON.stringify(json)
        console.log(postData)
    
    }
    
    
    
    
    
    
    </script>
    
    <div class="table-responsive">
        <form on:submit|preventDefault={formHandler}>
            <table class="table table=bordered">
                <tr>
                    <th>Room Name</th>
                    <td><input type="text" name="roomname" placeholder="Room Name" class="form-control" bind:value={postData.room_name}></td>
                </tr>
                <tr>
                    <th>Room Type</th>
                    <td>
                        <select bind:value={postData.room_typeid}>
                            {#each roomTypes as roomType (roomType.id)}
                                <option value={roomType.id}>{roomType.room_type}</option>
                            {/each}
                        </select>
                    </td>
                </tr>
            </table>
            
            <Button>Add</Button>
        </form>
    </div>
    
    <style>
        .form-control{
            width: 500px;
            display:inline-flex;
        }
    </style>