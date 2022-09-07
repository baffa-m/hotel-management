<script>
import { onMount } from "svelte";

    import Button from "./shared/Button.svelte";
    
    let persons

    $: persons = []

    onMount(async () => {
        const res = await fetch('https://ghwtjp.deta.dev/guest/')
        persons = await res.json()
        console.log(persons)
    })
    
    </script>
    
    <main>
        <table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Phone Number</th>
                    <th>Room</th>
                </tr>
            </thead>
            <tbody>
                {#each persons as person (person.id)}
                    <tr>
                        <td>{person.id}</td>
                        <td>{person.name}</td>
                        <td>{person.address}</td>
                        <td>{person.phone_no}</td>
                        <td></td>
                    </tr>
                {/each}
            </tbody>
        </table>
        
    </main>
    
    <style>
        table{
            width: max-content;
            text-align: center;
            border: 1px solid;
        }
        th, td{
            text-align: center;
            border: 1px solid;
        }
    </style>