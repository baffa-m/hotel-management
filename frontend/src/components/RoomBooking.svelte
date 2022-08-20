<script>
import Tabs from "./shared/Tabs.svelte"
import Customer from "./Customer.svelte"
import Button from "./shared/Button.svelte"
import Modal from "./shared/Modal.svelte"
import Rooms from "./Rooms.svelte"
import Booking from "./Booking.svelte"
import Summary from "./Summary.svelte"
import { createEventDispatcher } from 'svelte'
import { onMount } from "svelte";


    $: guests = ''

    onMount(async () => {
        const res = await fetch('http://localhost:8000/guest/')
        guests = await res.json()
    })
    
    const dispatch = createEventDispatcher()


    let items = ['Booking Details', 'Room Type', 'Personal Details', 'Summary']
    let activeItem = 'Booking Details'

    let bookinginfo

    const handleAdd = (e) => {
        bookinginfo = e.detail;
        activeItem = 'Room Type'

    }
    

    const getRoomType = (e) => {
        let id = e.detail.id
        let price = e.detail.price
        bookinginfo.roomType = id
        bookinginfo.price = price
        
        console.log(bookinginfo)
        activeItem = 'Personal Details'
    }

    let guestArray
    const getguests = (e) => {
        guestArray = e.detail
        console.log(guestArray)
        
        activeItem = 'Summary'
    }

    
    

    const formHandler = () => {
        console.log(guests)
        for (let i = 0; i < guests.length; i++) {
            console.log(guests[i])
            console.log(guests[i].phone_no)
            if (guests[i].phone_no === guestArray.phone_no) {
                console.log(guests[i].id)
            }
        }
       
    }

   
</script>
<Tabs {items} {activeItem}  />
{#if activeItem === 'Booking Details'}
<Booking on:add={handleAdd}/>
{:else if activeItem === 'Room Type'}
<Rooms on:add={getRoomType} />
{:else if activeItem === 'Personal Details'}
<Customer on:add={getguests} />
{:else if activeItem === 'Summary'}
<form on:submit|preventDefault={formHandler}>
    <table class="table table=bordered">
        <tr>
            <th>Name</th>
            <td><h3>{guestArray.name}</h3></td>
        </tr>
        <tr>
            <th>Check In</th>
            <td></td>
        </tr>
        <tr>
            <th>Check Out</th>
            <td></td>
        </tr>
        <tr>
            <th>Total Amount</th>
            <td></td>
        </tr>
        <tr>
            <th>Payment Status</th>
            <td></td>
        </tr>
        
    </table>
    <div>
        <Button>Submit</Button>
    </div>
</form>
{/if}


<style>

</style>