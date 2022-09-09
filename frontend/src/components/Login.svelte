<script>
import Button from "./shared/Button.svelte";
import axios from 'axios';
import Tabs from "./shared/Tabs.svelte"

        let items = ['Login', 'Register']
        let activeItem = 'Register'
    
        let username = '', password = ''
    
    
    $: formHandler = async () => {
        const response = axios.post('http://localhost:8000/login/', 
        {username, password}, 
        {withCredentials: true})
        if (response === 200) {
            axios.defaults.headers['Authorization'] = `Bearer ${response.data.token}`
        }
        

        /*const res = await fetch('http://localhost:8000/login/', {
            method: 'POST',
            headers : { 'Content-Type' : 'application/json'},
            body: JSON.stringify({username, password})
    
        })
        const json = await res.json()
        const result = JSON.stringify(json)
        console.log(result) */
        console.log(username) 
        console.log(password) 
    }

    const changeTab = (e) => {
        activeItem = e.detail
    }
    
    
    </script>
<Tabs {items} {activeItem} on:tabChange={changeTab} />

{#if activeItem === 'Login'}
<form on:submit|preventDefault={formHandler}>
    <table class="table table=bordered">
        <tr>
            <th>Username</th>
            <td><input type="text" placeholder="Username" bind:value={username} /></td>
        </tr>
        <tr>
            <th>Password</th>
            <td><input type="password" placeholder="Password" bind:value={password} /></td>
        </tr>
                        
    </table>
    <div>
        <Button>Login</Button>
    </div>
</form>
{/if}