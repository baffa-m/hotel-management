<script>
import MiniCard from "./shared/MiniCard.svelte";



</script>

<div class="main">
    <div>
        <MiniCard>
            <h1>1</h1>
            <p>Active Room</p>
        </MiniCard>
    </div>
    <div>
        <MiniCard>
            <h1>1</h1>
            <p>Active Room</p>
        </MiniCard>
    </div>
    <div>
        <MiniCard>
            <h1>1</h1>
            <p>Active Room</p>
        </MiniCard>
    </div>
</div>

<style>
    .main {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 8px;
	}

</style>