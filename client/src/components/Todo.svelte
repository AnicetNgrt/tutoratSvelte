<script>
    import Checkbox from "./Checkbox.svelte";

    export let description;
    export let done = false;
    export let onClicked;
    export let stateHandler;
</script>

<div class="todo-item {done ? 'done' : 'todo'}">
    <p class="description">
        {description}
    </p>

    <Checkbox onCheck={stateHandler} checked={done} />

    <div class="suppr" on:click={onClicked}>
        <svg viewbox="0 0 40 40">
            <path class="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
        </svg>
    </div>
</div>

<style>
    .todo-item {
        display: flex;
        align-items: center;
        padding: 0.5rem 0.5rem;
        border-radius: 0.5rem;
        transition: 0.3s ease-in-out;
        cursor: default;
    }

    .todo-item.todo:hover {
        background-color: #d6d6d6;
    }

    .todo-item.done:hover {
        background-color: #c0c3c9;
    }

    .todo {
        background-color: #f3f4f6;
    }

    .todo p {
        font-weight: 600;
        cursor: pointer;
    }

    .done {
        background-color: #e5e7eb;
    }

    .done p {
        font-weight: 500;
        text-decoration: line-through;
    }

    .description {
        flex-grow: 1;
    }

    .todo-item:not(:last-child) {
        margin-bottom: 0.5rem;
    }

    .suppr {
        opacity: 0;
        width: 20px;
        margin-left: 0.25rem;
        margin-top: 0.25rem;
        transition: 0.5s ease-in-out;
        cursor: pointer;
    }

    .close-x {
        stroke: #9ca3af;
        fill: transparent;
        stroke-linecap: round;
        stroke-width: 4;
        transition: 0.3s ease-in-out;
    }

    .suppr:hover .close-x {
        stroke: black;
    }

    .todo-item:hover .suppr {
        opacity: 100;
    }

    p {
        margin: 0;
    }
</style>
