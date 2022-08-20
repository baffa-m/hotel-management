<script>
import Footer from "./components/Footer.svelte";
import Header from "./components/Header.svelte";
import Card from "./components/shared/Card.svelte";
import Tabs from "./components/shared/Tabs.svelte";
import RoomBooking from "./components/RoomBooking.svelte";
import HallBooking from "./components/HallBooking.svelte";
import PoolBooking from "./components/PoolBooking.svelte";
import Modal from "./components/shared/Modal.svelte"



let items = ['Home', 'About', 'Register']
let activeItem = 'Home'

const options = [
		{ tab: 'Room',   component: RoomBooking   },
		{ tab: 'Hall', component: HallBooking },
		{ tab: 'Pool',  component: PoolBooking  },
	];

	let selected = options[0];


</script>
<Tabs {items} {activeItem}></Tabs>
<main>
	<Card>

		<select bind:value={selected}>
			{#each options as option}
				<option value={option}>{option.tab}</option>
			{/each}
		</select>
		<br />		
		<svelte:component this={selected.component} />
	</Card>
</main>
<Footer />

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: auto;
		text-align: center;
		
	}


</style>