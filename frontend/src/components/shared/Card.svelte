<div class="card">
    <slot></slot>
</div>

<style>
    .card{
        position: fixed;
        z-index: auto;
        background: #fff;
        padding: 20px;
        border-radius: 6px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        height: max-content;
        width: 800px;
    }
</style>