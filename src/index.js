const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.some((user) => user.username === username);

  if (!userExists) {
    return response.status(400).json({ error: "Usuário não existe" });
  }

  return next();
}

app.get("/users", (request, response) => {
  return response.json(users);
});

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "Usuário já existe" });
  }

  const newUser = {
    id: uuidv4(), // precisa ser um uuid
    name: name,
    username: username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  // console.log(username);
  const user = users.find((user) => user.username === username);
  const todos = user.todos;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const userIndex = users.findIndex((user) => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users[userIndex].todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request.headers;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);
  const todo = users[userIndex].todos[todoIndex];

  const updatedTodo = {
    ...todo,
    title,
    deadline: new Date(deadline),
  };

  const UserTodos = users[userIndex].todos;

  const idCheck = UserTodos.findIndex((todo) => todo.id === id);

  if (idCheck === -1) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  users[userIndex].todos[todoIndex] = updatedTodo;

  return response.status(201).json(users[userIndex].todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  const oldTodo = users[userIndex].todos[todoIndex];

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  if (userIndex < 0) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  users[userIndex].todos[todoIndex] = {
    ...oldTodo,
    done: true,
  };

  return response.status(201).json(users[userIndex].todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  if (userIndex === -1) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send("Todo deletado com sucesso");
});

module.exports = app;
