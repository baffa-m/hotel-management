<script>
    import Button from "./shared/Button.svelte";
    import axios from 'axios';
    
    const postData = []
    
    const formHandler = () => {
    
        axios.post
    }
    
    
    </script>
    
<form on:submit={formHandler}>
    <table class="table table=bordered">
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
 