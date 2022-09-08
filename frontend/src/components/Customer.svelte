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
    let errs = {name: '', address: '', phone_no: '', email: ''}
    let result
    let valid = false

    const formHandler = async () => {
    valid = true
    
    if (postData.name.trim().length < 5) {
        valid = false
        errs.name = 'Name not valid'
    } else {
        errs.name = ''
    }


    if (postData.phone_no.trim().length < 9) {
        valid = false
        errs.phone_no = 'Phone not valid'
    } else {
        errs.phone_no = ''
    }

    if (postData.email.trim().length < 10) {
        valid = false
        errs.email = 'Email not valid'
    } else {
        errs.email = ''
    }

    if (valid) {

    const res = await fetch('https://ghwtjp.deta.dev/guest/', {
            method: 'POST',
            headers : { "content-type" : "application/json"},
            body: JSON.stringify(postData)
    
        })
        const json = await res.json()
        result = JSON.stringify(json)
        let guest = JSON.parse(result)
        dispatch('add', guest)
     
        }
    }

</script>

<form on:submit|preventDefault={formHandler}>
    <table class="table table=bordered">
        <tr>
            <th>Name</th>
            <td><input type="text" name="name" bind:value={postData.name} placeholder="Name" class="form-control"></td>
        </tr>
        <tr>
            <th></th>
            <td><div class="errors">{errs.name}</div></td>
        </tr>
        <tr>
            <th>Address</th>
            <td><input type="text" name="address" bind:value={postData.address} placeholder="Address" class="form-control" ></td>
        </tr>
        <tr>
            <th>Phone Number</th>
            <td><input type="text" name="phone" bind:value={postData.phone_no} placeholder="Phone Number" class="form-control" ></td>
        </tr>
        <tr>
            <th></th>
            <td><div class="errors">{errs.phone_no}</div></td>
        </tr>
        <tr>
            <th>Email</th>
            <td><input type="text" name="email" bind:value={postData.email} placeholder="Email Address" class="form-control"></td>
        </tr>
        <tr>
            <th></th>
            <td><div class="errors">{errs.email}</div></td>
        </tr>
        
    </table>
    
    <Button>Submit</Button>
</form>