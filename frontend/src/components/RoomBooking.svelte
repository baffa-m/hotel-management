<script>
import Tabs from "./shared/Tabs.svelte"
import Customer from "./Customer.svelte"
import Button from "./shared/Button.svelte"
import Rooms from "./Rooms.svelte"
import Booking from "./Booking.svelte"
import { onMount } from "svelte";
import axios from "axios"


    $: guests = ''

    onMount(async () => {
        const res = await fetch('http://localhost:8000/guest/')
        guests = await res.json()
    })
    

    let items = ['Personal Details', 'Booking Details', 'Room Type', 'Summary']
    let activeItem = 'Personal Details'

    let bookinginfo

    const handleAdd = (e) => {
        bookinginfo = e.detail;
        activeItem = 'Room Type'
        console.log(bookinginfo)

        
    }


    const getRoomType = (e) => {
        let id = e.detail.id
        let price = e.detail.price
        bookinginfo.room_id = id
        bookinginfo.price = price
        bookinginfo.total_price = bookinginfo.price * bookinginfo.total_days

        for (let i = 0; i < guests.length; i++) {
            if (guests[i].phone_no === guestArray.phone_no) {
                bookinginfo.guest_id = guests[i].id
            }
        }

                
        activeItem = 'Summary'
    }

    let guestArray
    const getguests = (e) => {
        guestArray = e.detail
        console.log(guestArray)
          
        activeItem = 'Booking Details'
    }

 
    
    let postData = {
        checkin_date: '',
        checkout_date: '',
        guest_id: '',
        room_id: '',
        total_price: '',
        payment_status: ''

    }
    let result
    const formHandler = async () => {

                        
        postData.checkin_date = bookinginfo.chekin_date
        postData.checkout_date = bookinginfo.chekout_date
        postData.guest_id = bookinginfo.guest_id
        postData.room_id = bookinginfo.room_id
        postData.total_price = bookinginfo.total_price
        postData.payment_status = false

        const res = await fetch('https://ghwtjp.deta.dev/reservations/', {
            method: 'POST',
            headers : { "content-type" : "application/json"},
            body: JSON.stringify(postData)
    
        })
        const json = await res.json()
        result = JSON.stringify(json)
        console.log(postData)
        
        try {
            axios.patch(`https://ghwtjp.deta.dev/room/${postData.room_id}`, {available: false, checked: false})
        } catch (e) {
            console.log(e)
        }

        activeItem = 'Personal Details'
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
            <td>{guestArray.name}</td>
        </tr>
        <tr>
            <th>Check In</th>
            <td>{bookinginfo.chekin_date}</td>
        </tr>
        <tr>
            <th>Check Out</th>
            <td>{bookinginfo.chekout_date}</td>
        </tr>
        <tr>
            <th>Total Amount</th>
            <td>{bookinginfo.total_price}</td>
        </tr>
        <tr>
            <th>Payment Status</th>
            <td>Unpaid</td>
        </tr>
        
    </table>
    <div>
        <Button>Submit</Button>
    </div>
</form>
{/if}


<style>

</style>