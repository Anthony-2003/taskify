import React, { useState, useEffect } from "react";
import { InputField } from "./components/InputField";
import { Todo } from "./model";
import { TodoList } from "./components/TodoList";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

function App() {
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>(() => {
    const storedTodos = localStorage.getItem("todos");
    return storedTodos ? JSON.parse(storedTodos) : [];
  });
  const [completedTodo, setCompletedTodo] = useState<Todo[]>(() => {
    const storedCompletedTodos = localStorage.getItem("completedTodos");
    return storedCompletedTodos ? JSON.parse(storedCompletedTodos) : [];
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (todo) {
      setTodos([...todos, { id: Date.now(), todo, isDone: false }]);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    let add, active = todos, complete = completedTodo;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (source.droppableId === 'activeTasks') {
      add = active[source.index];
      active.splice(source.index, 1);
    } else {
      add = complete[source.index];
      complete.splice(source.index, 1);
    }

    if (source.droppableId === 'completedTasks') {
      active.splice(destination.index, 0, add);
    } else {
      complete.splice(destination.index, 0, add);
    }

    setCompletedTodo([...complete]);
    setTodos([...active]);
  };

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("completedTodos", JSON.stringify(completedTodo));
  }, [completedTodo]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <main className="h-screen bottom-0 flex items-center flex-col max-w-[1440px] mx-auto">
        <h1 className="text-4xl font-neucha p-4 text-white uppercase z-10">
          Taskify
        </h1>
        <InputField todo={todo} setTodo={setTodo} handleAdd={handleAdd} />
        <TodoList
          todos={todos}
          setTodos={setTodos}
          completedTodos={completedTodo}
          setCompletedTodos={setCompletedTodo}
        />
      </main>
    </DragDropContext>
  );
}

export default App;
