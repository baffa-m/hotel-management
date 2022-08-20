<script>
    import axios from "axios";
    import Button from "./shared/Button.svelte";
    import { createEventDispatcher } from 'svelte'

    let dispatch = createEventDispatcher()

    const postData = {
        name: '',
        address: '',
        phone_no: '',
        email: ''
    }
    let result

    const formHandler = async () => {
        

    const res = await fetch('http://localhost:8000/guest/', {
            method: 'POST',
            headers : { "content-type" : "application/json"},
            body: JSON.stringify(postData)
    
        })
        const json = await res.json()
        result = JSON.stringify(json)
        dispatch('add', postData)
        
    }

</script>

<form on:submit|preventDefault={formHandler}>
    <table class="table table=bordered">
        <tr>
            <th>Name</th>
            <td><input type="text" name="name" bind:value={postData.name} placeholder="Name" class="form-control"></td>
        </tr>
        <tr>
            <th>Address</th>
            <td><input type="text" name="address" bind:value={postData.address} placeholder="Address" class="form-control" ></td>
        </tr>
        <tr>
            <th>Name</th>
            <td><input type="text" name="phone" bind:value={postData.phone_no} placeholder="Phone Number" class="form-control" ></td>
        </tr>
        <tr>
            <th>Email</th>
            <td><input type="text" name="email" bind:value={postData.email} placeholder="Email Address" class="form-control"></td>
        </tr>
        
    </table>
    
    <Button>Submit</Button>
</form>