<script>
import Button from "./shared/Button.svelte";
export let roomId
$: postData = {}
const formHandler = () => {
    console.log(roomId)
}

</script>
<p>{roomId}</p>
    <form on:submit|preventDefault={formHandler}>
        <table class="table table=bordered">
            <tr>
                <th>Description</th>
                <td><textarea cols="50" rows="5" name="description" class="form-control" placeholder="Description" bind:value={postData.description} ></textarea></td>
            </tr>
            <tr>
                <th>Cost</th>
                <td><input name="cost" class="form-control" placeholder="Cost" bind:value={postData.cost}></td>
            </tr>
        </table>
        
        <Button>Add</Button>
    </form>
