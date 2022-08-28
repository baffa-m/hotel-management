<script>
import AddRoom from "./components/AddRoom.svelte";
import Bookings from "./components/Bookings.svelte";
import CreateRoom from "./components/CreateRoom.svelte";
import Guests from "./components/Guests.svelte";
import Header from "./components/Header.svelte";
import Rooms from "./components/Rooms.svelte";
import RoomType from "./components/RoomType.svelte";
import RoomTypeForm from "./components/RoomTypeForm.svelte";
import Card from "./components/shared/Card.svelte"
import Tabs from "./components/shared/Tabs.svelte"
import Hall from "./components/Hall.svelte";
import Login from "./components/Login.svelte";
import Home from "./components/shared/Home.svelte";
import BookedRooms from "./components/BookedRooms.svelte";
	

	let items = ['Home', 'Bookings', 'Booked Rooms', 'Guests', 'Room Types', 'Rooms', 'Hall']
	let activeItem = 'Bookings'

	const tabChange = (e) => {
		activeItem = e.detail;
	}


</script>
<Header />
<Tabs {activeItem} {items} on:tabChange={tabChange} />
<main>
	<!--<div class="card-field">
		<Card>
			<Login />
		</Card>
	</div> -->
<Card>
	{#if activeItem === 'Home'}
			<Home />
	{:else if activeItem === 'Bookings'}
			<Bookings />
	{:else if activeItem === 'Booked Rooms'}
		<BookedRooms />>
	{:else if activeItem === 'Guests'}
			<Guests />
	{:else if activeItem === 'Room Types'}
			<RoomType />
	{:else if activeItem === 'Rooms'}
		<Rooms />
	{:else if activeItem === 'Hall'}
			<Hall />
	{/if}
</Card>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
</style>