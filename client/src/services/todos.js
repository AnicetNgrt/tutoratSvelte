const getAll = () => {
  return JSON.parse(localStorage.getItem('todos'));
};

const create = (todo) => {
  return persist([...getAll(), todo]);
};

const update = (id, todo) => {
  const todos = getAll()
    .filter(t => t.id !== id)
    .push(todo);
  return request.then((response) => response.data);
};

const remove = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
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