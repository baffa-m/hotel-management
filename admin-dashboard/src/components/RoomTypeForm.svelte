<script>
import Button from "./shared/Button.svelte";
import Card from "./shared/Card.svelte";

let postData = {
    room_type: '',
    description: '',
    cost: ''
}
let valid = false
let errors = {room_type: '', cost: ''};
let result = null


const formHandler = async () => {
    if (postData.room_type.trim().length < 1) {
            valid = false
            errors.room_type = 'Room Type Cannot Be Empty'
    }
    else {
        errors.room_type = ''
    }
    
    if (postData.cost.trim().length < 1) {
            valid = false
            errors.cost = 'Cost Cannot Be Empty'
    }
    else if (typeof postData === 'number' && !Number.isNaN(postData)) {
        valid = false
        errors.cost = 'Cost must be a Number'
    }
    else {
        errors.cost = ''
    }

    const res = await fetch('http://localhost:8000/room-type/', {
        method: 'POST',
        headers : { "content-type" : "application/json"},
        body: JSON.stringify(postData)

    })
    const json = await res.json()
    result = JSON.stringify(json)
    console.log(postData)

}






</script>

<div class="table-responsive">
    <form on:submit|preventDefault={formHandler}>
        <table class="table table=bordered">
            <tr>
                <th>Title</th>
                <td><input type="text" name="title" placeholder="Title" class="form-control" bind:value={postData.room_type}></td>
            </tr>
            <tr>
                <th>Description</th>
                <td><textarea cols="50" rows="5" name="description" class="form-control" placeholder="Description" bind:value={postData.description}></textarea></td>
            </tr>
            <tr>
                <th>Cost</th>
                <td><input name="cost" class="form-control" placeholder="Cost" bind:value={postData.cost}></td>
            </tr>
        </table>
        
        <Button>Add</Button>
    </form>
</div>


<style>
    .form-control{
        width: 500px;
        display:inline-flex;
    }
</style>