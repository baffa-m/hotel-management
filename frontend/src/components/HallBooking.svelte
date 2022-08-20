<script>
    import Tabs from "./shared/Tabs.svelte"
    import Customer from "./Customer.svelte"
    import Button from "./shared/Button.svelte"
    import Modal from "./shared/Modal.svelte"
    import Rooms from "./Rooms.svelte"
    import Booking from "./Booking.svelte"
    import Hall from "./Hall.svelte"
    import { createEventDispatcher } from 'svelte'
        
        const dispatch = createEventDispatcher()
        const formHandler = () => {
    
    
           
        }
    
    
    
        let items = ['Booking Details', 'Personal Details']
        let activeItem = 'Booking Details'
    
        let bookinginfo
    
        const handleAdd = (e) => {
            bookinginfo = e.detail;
            activeItem = 'Personal Details'
    
        }
        
    
       
    </script>
    <Tabs {items} {activeItem}  />
    {#if activeItem === 'Booking Details'}
    <Hall on:add={handleAdd}/>

    {:else if activeItem === 'Personal Details'}
    <Customer />
    {/if}
    
    
    <style>
    
    </style>