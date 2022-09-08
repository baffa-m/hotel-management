<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let items;
    export let activeItem;

</script>

<div class="tabs">
    <ul>
        {#each items as item}
            <li on:click={() => dispatch('tabChange', item)}>
                <div class:active={item === activeItem}>{item}</div>
            </li>  
        {/each}
    </ul>
</div>

<style>
    .tabs {
        margin: 0;
        padding: 0;
    }

    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        width: 25%;
        background-color: #f1f1f1;
        border: 1px solid #555;
        overflow: auto;
        position: fixed;
        height: 100%;

    }

    li  {
    display: block;
    color: #000;
    padding: 8px 16px;
    text-decoration: none;
    }

    li :hover {
    background-color: #d81b42;
    color: white;
    cursor: pointer;
    }

    .active {
        color: #d81b42;
        border-bottom: 2px solid #d91b42;
        padding-bottom: 8px;
    }

</style>