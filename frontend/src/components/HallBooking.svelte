<script>
    import { onMount } from "svelte";
    import axios from "axios"
    import Tabs from "./shared/Tabs.svelte"
    import Customer from "./Customer.svelte"
    import Button from "./shared/Button.svelte"
    import Hall from "./Hall.svelte"
    import HallSelect from "./HallSelect.svelte"
        

    $: guests = ''

    onMount(async () => {
        const res = await fetch('http://localhost:8000/guest/')
        guests = await res.json()
    })


    let postData = {
        checkin_date: '',
        checkout_date: '',
        guest_id: '',
        hall_id: '',
        total_price: '',
        payment_status: ''

    }
    let result
    let errMsg
    const formHandler = () => {

        postData.checkin_date = bookinginfo.chekin_date
        postData.checkout_date = bookinginfo.chekout_date
        postData.guest_id = bookinginfo.guest_id
        postData.hall_id = bookinginfo.hall_id
        postData.total_price = bookinginfo.total_price
        postData.payment_status = false
            
        try {
            axios.post('https://ghwtjp.deta.dev/reservations-hall/', postData)
            console.log(postData)
        } catch (e) {
            errMsg = e
            console.log(errMsg)
        }
           
    }
    
    
    
        let items = ['Personal Details', 'Booking', 'Halls', 'Summary']
        let activeItem = 'Personal Details'
    
        let bookinginfo
    
        const handleAdd = (e) => {
            bookinginfo = e.detail;
            activeItem = 'Halls'
    
        }

        const getHallInfo = (e) => {
            bookinginfo.hall_id = e.detail.id
            bookinginfo.price = e.detail.price
            bookinginfo.total_price = bookinginfo.price * bookinginfo.total_days

            for (let i = 0; i < guests.length; i++) {
            if (guests[i].phone_no === guestArray.phone_no) {
                bookinginfo.guest_id = guests[i].id
            }
            }

            console.log(bookinginfo)

            activeItem = 'Summary'
            
        }

        let guestArray
        const getguests = (e) => {
            guestArray = e.detail
            console.log(guestArray)
            
            activeItem = 'Booking'
        }
        
    
       
    </script>
    <Tabs {items} {activeItem}  />
    {#if activeItem === 'Booking'}
    <Hall on:add={handleAdd}/>
    {:else if activeItem === 'Halls'}
    <HallSelect on:add={getHallInfo} />
    {:else if activeItem === 'Personal Details'}
    <Customer on:add={getguests}/>
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