<script>
    import axios from 'axios'
    import { onMount } from 'svelte';
    import Button from './shared/Button.svelte'
    import { createEventDispatcher } from 'svelte'
import { get } from 'svelte/store';


    const dispatch = createEventDispatcher()

    
    $: halls = ''

    onMount(async () => {
        const res = await fetch('https://ghwtjp.deta.dev/hall/')
        halls = await res.json()
           
    })

    let hallInfo = {id: '', price: ''}
    const formHandler = (id, price) => {
        hallInfo.id = id
        hallInfo.price = price
        dispatch('add', hallInfo)

    }
</script>

<main>
    <div class="container text-center">
        {#each halls as hall (hall.id)}
            {#if !hall.booked}
            <div on:click={formHandler(hall.id, hall.cost)} class="card mb-3" style="max-width: 540px;" >
                <div class="row g-0">
                <div class="col-md-4">
                    <img src="..." class="img-fluid rounded-start" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                    <h5 class="card-title">{hall.hall_name}</h5>
                    <p class="card-text">{hall.seats} Seats</p>
                    <p class="card-text"><b>₦{hall.cost}/day</b></p>
                    </div>
                </div>
                </div>
            </div>
            {/if}
        {/each}
</main>
<style>

</style>