<script>
	import Todo from "./components/Todo.svelte";
	import TodoInput from "./components/TodoInput.svelte";

	import todoService from "./services/todos.js";

	let todos = [];

	const sortTodos = () => {
		todos = todos.sort((a, b) =>
			a.done - b.done === 0 ? b.id - a.id : a.done - b.done
		);
	};

	todoService.getAll().then((data) => {
		todos = data;
		sortTodos();
	});

	async function onTodoSuppr(id) {
		const res = await todoService.remove(id);
		todos = todos.filter((t) => t.id !== id);
	}

	async function onTodoCreate(description) {
		const res = await todoService.create({ description });
		todos = [res, ...todos];
	}

	async function switchTodoState(id) {
		let todo = todos.find((t) => t.id === id);

		const data = await todoService.update(id, {
			done: !todo.done,
		});

		todos = todos.map((t) => {
			if (t.id === id) {
				return data;
			}
			return t;
		});

		setTimeout(sortTodos, 200);
	}
</script>

<main>
	<h1 class="title">Bonsoir à tous</h1>
	<div class="page_container">
		<div class="top_panel">
			<TodoInput onConfirm={onTodoCreate} />
		</div>

		<div class="main_panel">
			{#each todos as { description, done, id }}
				<Todo
					{description}
					{done}
					onClicked={() => onTodoSuppr(id)}
					stateHandler={() => switchTodoState(id)}
				/>
			{/each}
		</div>
	</div>
</main>

<style>
	.top_panel {
		border-bottom: 1px solid #202020;
		padding: 1em;
	}

	.main_panel {
		padding: 1em 3em 1em 3em;
	}

	.title {
		text-align: center;
	}

	.page_container {
		margin: auto;
		max-width: 50%;
		border: 1px solid #202020;
		border-radius: 0.5rem;
	}
</style>
