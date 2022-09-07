<script>
import Button from "./shared/Button.svelte";
import { onMount } from "svelte";

let postData = {
    booking_date: '',
    checkin_date: '',
    checkout_date: ''
}

const formHandler = async () => {    
        const res = await fetch('https://ghwtjp.deta.dev/reservations/', {
            method: 'POST',
            headers : { "content-type" : "application/json"},
            body: JSON.stringify(postData)
    
        })
        const json = await res.json()
        result = JSON.stringify(json)
        console.log(postData)
    
    }

let guests = []
onMount(async () => {
    const res = await fetch('https://ghwtjp.deta.dev/guest/')
        guests = await res.json()
        console.log(guests)
})

</script>

<form on:submit|preventDefault={formHandler}>
    <table class="table table=bordered">
        <tr>
            <th>Select Customer</th>
            <td>
                <select bind:value={postData.guest_id}>
                    {#each guests as guest (guest.id)}
                        <option value={guest.id}>{guest.name}</option>
                    {/each}
                </select>
            </td>
        </tr>
        <tr>
            <th>Check-in Date</th>
            <td><input type="date" name="checkin date" class="form-control" ></td>
        </tr>
        <tr>
            <th>Check-out Date</th>
            <td><input type="date" name="checkout date" class="form-control" ></td>
        </tr>
        <tr>
            <th>Booking Date</th>
            <td><input type="date" name="checkin date" class="form-control" ></td>
        </tr>
    </table>
    
    <Button>Add</Button>
</form>

<style>

</style>