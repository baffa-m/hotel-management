<script>
import axios from "axios";

    import Button from "./shared/Button.svelte";

    const postData = {
        username: '',
        password: '',
        is_admin: 0
    }

    const formHandler = () => {
        axios.post('https://ghwtjp.deta.dev/user', postData)
        .then((response) => {
            console.log(response)
        }, (error) => {
            console.log(error)
        })
    }

</script>

<form on:submit|preventDefault={formHandler}>
    <table class="table table=bordered">
        <tr>
            <th>Email</th>
            <td><input type="text" placeholder="Email" bind:value={postData.email} /></td>
        </tr>
        <tr>
            <th>Username</th>
            <td><input type="text" placeholder="Username" bind:value={postData.username} /></td>
        </tr>
        <tr>
            <th>Password</th>
            <td><input type="password" placeholder="Password" bind:value={postData.password} /></td>
        </tr>
                        
    </table>
    <div>
        <Button>Login</Button>
    </div>
</form>