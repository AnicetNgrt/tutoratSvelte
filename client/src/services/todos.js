const getAll = async () => {
  return JSON.parse(localStorage.getItem('todos') || '[]');
};

const create = async (todo) => {
  persist([...(await getAll()), todo]);
  return todo;
};

const update = async (id, todo) => {
  const todos = (await getAll())
    .filter(t => t.id !== id);
  persist([...todos, todo]);
  return todo;/blakz$d$aâù
};

const remove = async (id) => {
  persist((await getAll()).filter(t => t.id !== id));
  return {};
};

const persist = (todos) => {
  localStorage.setItem('todos', JSON.stringify(todos));
}

export default { 
  getAll, 
  create, 
  update,
	remove
}