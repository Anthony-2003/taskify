import React, { useEffect, useRef, useState } from "react";
import { Todo } from "../model";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdDone } from "react-icons/md";
import { Draggable } from "react-beautiful-dnd";
import Swal from "sweetalert2";

type Props = {
  index: number;
  todo: Todo;
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};

export const SingleTodo = ({ index, todo, todos, setTodos }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [editTodo, setEditTodo] = useState<string>(todo.todo);

  const handleDone = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Do you want to delete the task?",
      showDenyButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        setTodos(todos.filter((todo) => todo.id !== id));
        Swal.fire("deleted", "", "success");
      }
    });
  };

  const handleEdit = (e: React.FormEvent, id: number) => {
    e.preventDefault();

    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, todo: editTodo } : todo))
    );

    setEdit(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [edit]);

  return (
    <Draggable draggableId={todo.id.toString()} index={index}>
      {(provided) => (
        <form
          className="flex flex-wrap justify-between w-[100%] rounded-[5px] p-[20px] my-[10px] bg-[url('https://img.freepik.com/free-photo/crumpled-yellow-paper-background-close-up_60487-2390.jpg?size=626&ext=jpg')] z-10 hover:scale-[1.01] hover:shadow-[0_0_5px_#000]"
          onSubmit={(e) => handleEdit(e, todo.id)}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {edit ? (
            <input
              ref={inputRef}
              value={editTodo}
              onChange={(e) => setEditTodo(e.target.value)}
              className=""
            />
          ) : todo.isDone ? (
            <s className="flex-1 w-[90%] break-words pointer-events-none">
              {todo.todo}
            </s>
          ) : (
            <span className="flex-1 w-[90%] break-words pointer-events-none">
              {todo.todo}
            </span>
          )}

          <div className="flex justify-around">
            <span
              className="text-2xl cursor-pointer"
              onClick={() => {
                if (!edit && !todo.isDone) {
                  setEdit(!edit);
                }
              }}
            >
              <FaEdit />
            </span>
            <span
              className="text-2xl cursor-pointer"
              onClick={() => handleDelete(todo.id)}
            >
              <MdDelete />
            </span>
            <span
              className="text-2xl cursor-pointer"
              onClick={() => handleDone(todo.id)}
            >
              <MdDone />
            </span>
          </div>
        </form>
      )}
    </Draggable>
  );
};
