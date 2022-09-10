<script>
import AddBookings from './AddBookings.svelte';
import BookingsList from './BookingsList.svelte';
import Button from './shared/Button.svelte'

    
    
    let activeTab = BookingsList
    
    </script>
    
    <main>
        <div class="butttons" on:click={() => (activeTab = BookingsList)}>
            <Button>View All</Button>
        </div>
        <br>
        <br>
        <svelte:component this={activeTab} /> 
        <br>
        <div on:click={() => (activeTab = AddBookings)}>
        </div>
    
    </main>
    
    <style>
        .butttons{
            text-align: right;
        }
    </style>