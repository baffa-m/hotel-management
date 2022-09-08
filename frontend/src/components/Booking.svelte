<script>
import Button from "./shared/Button.svelte";
import { onMount } from "svelte";
import { createEventDispatcher } from 'svelte'

let dispatch = createEventDispatcher();



let fields = {chekin_date: '', chekout_date: '', room_id: '', price: '', total_price: '', guest_id: '', total_days: ''}
let err = {chekin: '', checkout: ''}
let valid = false;

const formHandler = () => {
    valid = true 

    //validate booking
    let current_date = new Date(formatDate(new Date ))
    let chekin = new Date (fields.chekin_date)
    let checkout = new Date (fields.chekout_date)
    let difference = Math.abs(chekin - current_date)
    let days = difference/(1000 * 3600 * 24)
    let totalDays = Math.abs(checkout - chekin) / (1000 * 3600 * 24)
    fields.total_days = totalDays

    if (fields.chekin_date === '') {
        valid = false
        err.chekin = 'Check-in date cannot be empty'
    } else {
        err.chekin = ''
    }

    if (fields.chekout_date === '') {
        valid = false
        err.checkout = 'Check-out date cannot be empty'
    } else {
        err.checkout = ''
    }

    if (days > 3)  {

        valid = false
        err.chekin = "You cannot book more than 3 ahead"
    } else {
        err.chekin = ''
    }

    
    if (valid) {
        let bookinginfo = {...fields}
        dispatch('add', bookinginfo)
        console.log(bookinginfo)
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    return [year, month, day].join('-');
}

 



</script>

<form on:submit|preventDefault={formHandler}>
    <table class="table table=bordered">
        <tr>
            <th>Check-in Date</th>
            <td><input type="date" name="checkin date" min={formatDate(new Date())} class="form-control" bind:value={fields.chekin_date}></td>
        </tr>
        <tr>
            <th></th>
            <td><div class="errors">{err.chekin}</div></td>
        </tr>
        <tr>
            <th>Check-out Date</th>
            <td><input type="date" name="checkout date" min={formatDate(new Date())} class="form-control" bind:value={fields.chekout_date}></td>
        </tr>
        <tr>
            <th></th>
            <td><div class="errors">{err.checkout}</div></td>
        </tr>
        
    </table>
    <Button>Submit</Button>
</form>

<style>

</style>