<script>
    import Button from "./shared/Button.svelte";
    
    let postData = {
        hall_name: '',
        seats: '',
        cost: '',
        booked: false
    }
    let valid = false
    let errors = {room_type: '', cost: ''};
    let result = null
    
    
    const formHandler = async () => {    
        const res = await fetch('https://ghwtjp.deta.dev/hall/', {
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
                <td><input type="text" name="title" placeholder="Title" class="form-control" bind:value={postData.hall_name}></td>
            </tr>
            <tr>
                <th>Seats</th>
                <td><input type="number" name="seats" class="form-control" placeholder="Number Of Seats" bind:value={postData.seats}></td>
            </tr>
            <tr>
                <th>Cost</th>
                <td><input type="number" name="cost" class="form-control" placeholder="Cost" bind:value={postData.cost}></td>
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