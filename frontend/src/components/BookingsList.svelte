<script>
    import { onMount } from "svelte";
        
        let bookings = []
    
        onMount(async () => {
            const res = await fetch('http://localhost:8000/reservations/')
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
                </tr>
            </thead>
            <tbody>
                {#each bookings as booking (booking.id)}
                    <tr>
                        <td>{booking.id}</td>
                        <td>{booking.booking_date}</td>
                        <td>{booking.checkin_date}</td>
                        <td>{booking.checkout_date}</td>
                        <td>{booking.checkout_time}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <hr />
        <hr />
        
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
        .but{
            text-align: right;
        }
    </style>