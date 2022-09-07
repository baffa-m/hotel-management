<script>
    import { onMount } from "svelte";
        
        let bookings = []
    
        onMount(async () => {
            const res = await fetch('https://ghwtjp.deta.dev/reservations/')
            bookings = await res.json()
            console.log(bookings)
        })
    
    
    </script>
    
    <main>
        <table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>Booking Date</th>
                    <th>Check-in Date</th>
                    <th>Check-out date</th>
                    <th>Guest Name</th>
                    <th>Total Price</th>
                    <th>Payment Status</th>
                </tr>
            </thead>
            <tbody>
                {#each bookings as booking (booking.id)}
                    <tr>
                        <td>{booking.id}</td>
                        <td>{booking.booking_date}</td>
                        <td>{booking.checkin_date}</td>
                        <td>{booking.checkout_date}</td>
                        <td>{booking.guest.name}</td>
                        <td>{booking.total_price}</td>
                        <td>
                            {#if booking.payment_status}
                                Paid

                            {:else}
                                Unpaid
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <br />
        
    </main>
    
    <style>
        table{
            width: 400px;
            text-align: center;
            border: 1px solid;
        }
        th, td{
            text-align: center;
            border: 1px solid;
        }
        main {
            text-align: center;
        }
    </style>