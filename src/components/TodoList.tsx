import { Droppable } from "react-beautiful-dnd";
import { Todo } from "../model";
import { SingleTodo } from "./SingleTodo";
type Props = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  completedTodos: Todo[];
  setCompletedTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};

export const TodoList = ({ todos, setTodos, completedTodos, setCompletedTodos }: Props) => {

  return (
    <div className="w-[88%] flex justify-between gap-2 mt-3 max-sm:flex-col font-neucha">
      <Droppable droppableId="activeTasks">
        {(provided) => (
          <div
            className="flex-1 bg-[#33C3CD] p-2 self-start w-full mb-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <span className="text-white text-2xl">Active Tasks</span>
            {todos.map((todo, index) => (
              <SingleTodo
                index={index}
                todo={todo}
                todos={todos}
                key={todo.id}
                setTodos={setTodos}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Droppable droppableId="completedTasks">
        {(provided) => (
          <div
            className="flex-1 bg-[#EB6751] p-2 border-none self-start w-full mb-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <span className="text-white text-2xl">Completed Tasks</span>
            {completedTodos.map((todo, index) => (
              <SingleTodo
                index={index}
                todo={todo}
                todos={completedTodos}
                key={todo.id}
                setTodos={setCompletedTodos}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
