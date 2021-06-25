<script>
    export let onConfirm;

    let description = "";
</script>

<div class="todo-input">
    <input placeholder="Do something..." bind:value={description} />
    <div class="confirm" on:click={() => onConfirm(description)}>CONFIRM</div>
</div>

<style>
    .todo-input {
        display: flex;
    }

    .todo-input input {
        margin: 0;
        border-radius: 0.5rem;
        border: 0;
        background-color: #f3f4f6;
        flex-grow: 1;
    }

    .confirm {
        background-color: #34d399;
        color: white;
        border-radius: 0.25rem;
        padding: 0.5rem 2.5rem;
        height: max-content;
        margin-left: 1rem;
        transition: 0.5s ease-in-out;
    }

    .confirm:hover {
        background-color: #10b981;
        cursor: pointer;
    }
</style>
