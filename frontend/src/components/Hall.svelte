<script>
    import Button from "./shared/Button.svelte";
    import { onMount } from "svelte";
    import { createEventDispatcher } from 'svelte'
    
    let dispatch = createEventDispatcher();
    
    const disabledDates = () => {
        var today,dd,mm,yyyy
        today = new Date()
        dd = today.getDate()+1
        mm = today.getMonth()+1
        yyyy = today.getFullYear();
    }

    $: halls = ''
    onMount(async () => {
        const res = await fetch('http://localhost:8000/hall')
        halls = await res.json()
        console.log(halls)
    })
    
    
    
    let fields = {chekin_date: '', chekout_date: '', roomType: ''}
    let err = {chekin: '', checkout: ''}
    let valid = false;
    
    const formHandler = () => {
        valid = true 
        
        if (valid) {
            let bookinginfo = {...fields}
            dispatch('add', bookinginfo)
        }
    }
    
    
    </script>
    
    <form on:submit|preventDefault={formHandler}>
        <table class="table table=bordered">
            <tr>
                <th>Hall Name</th>
                <td>
                    <select>
                        {#each halls as hall (hall.id)}
                            <option value={hall.id}>{hall.hall_name} ---- {hall.seats} Seats</option>
                        {/each}
                    </select>
                </td>
            </tr>
            <tr>
                <th>Check-in Date</th>
                <td><input type="date" name="checkin date" min={disabledDates()} class="form-control" bind:value={fields.chekin_date}></td>
            </tr>
            <tr>
                <th>Check-out Date</th>
                <td><input type="date" name="checkout date" class="form-control" bind:value={fields.chekout_date}></td>
            </tr>
            <tr>
                
            </tr>
            
        </table>
        <Button>Submit</Button>
    </form>
    
    <style>
    
    </style>