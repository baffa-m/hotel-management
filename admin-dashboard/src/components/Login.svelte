<script>
import Button from "./shared/Button.svelte";
import axios from 'axios';

const postData = []

const formHandler = () => {

    axios.post
}


</script>

<form on:submit={formHandler}>
    <input type="text" placeholder="Username" bind:value={postData.username} />
    <input type="password" placeholder="Password" bind:value={postData.password} />
    <Button>Login</Button>
</form>