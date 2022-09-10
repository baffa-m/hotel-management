<script>
import Footer from "./components/Footer.svelte";
import Card from "./components/shared/Card.svelte";
import Tabs from "./components/shared/Tabs.svelte";
import RoomBooking from "./components/RoomBooking.svelte";
import HallBooking from "./components/HallBooking.svelte";
import Login from "./components/Login.svelte";
import Bookings from "./components/Bookings.svelte";
import Guests from "./components/Guests.svelte";
import RoomType from "./components/RoomType.svelte";
import Home from "./components/Home.svelte";
import BookedRooms from "./components/BookedRooms.svelte";
import RoomsTab from "./components/RoomsTab.svelte";
import HallTab from "./components/HallTab.svelte";
import SideTab from "./components/shared/SideTab.svelte"



let items = ['Home', 'About', 'Admin']
let activeItem = 'Home'

let tabs = ['Home', 'Bookings', 'Booked Rooms', 'Guests', 'Room Types', 'Rooms', 'Hall']
let activeTab = 'Home'

const itemChange = (e) => {
	activeItem = e.detail
}

const tabChange = (e) => {
	activeTab = e.detail
}

const options = [
		{ tab: 'Room',   component: RoomBooking   },
		{ tab: 'Hall', component: HallBooking },
	];

	let selected = options[0];


</script>
<Tabs {items} {activeItem} on:tabChange={itemChange}></Tabs>
{#if activeItem === 'Admin'}
<SideTab items={tabs} activeItem={activeTab} on:tabChange={tabChange}></SideTab>
{/if}
<main>
	<Card>
	{#if activeItem === 'Home'}
		<select bind:value={selected}>
			{#each options as option}
				<option value={option}>{option.tab}</option>
			{/each}
		</select>
		<br />		
		<svelte:component this={selected.component} />
	{:else if activeItem === 'Admin'}
		{#if activeTab === 'Home'}
				<Home />
		{:else if activeTab === 'Bookings'}
				<Bookings />
		{:else if activeTab === 'Booked Rooms'}
			<BookedRooms />
		{:else if activeTab === 'Guests'}
				<Guests />
		{:else if activeTab === 'Room Types'}
				<RoomType />
		{:else if activeTab === 'Rooms'}
			<RoomsTab />
		{:else if activeTab === 'Hall'}
				<HallTab />
		{/if}
	
	{/if}
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