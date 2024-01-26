import { useRef } from "react";

type Props = {
  todo: string;
  setTodo: React.Dispatch<React.SetStateAction<string>>;
  handleAdd: (e: React.FormEvent) => void;
};

export const InputField = ({ todo, setTodo, handleAdd }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex w-[90%] relative items-center"
      onSubmit={(e) => {
        handleAdd(e);
        inputRef.current?.blur();
        setTodo('');
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a task"
        className="w-full rounded-[50px] p-[20px] px-[30px] text-[25px] border-none transition outline-none focus:shadow-[0_35px_10px_1000px_#183A61]"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
      />
      <button
        type="submit"
        className="absolute w-[50px] h-[50px] m-[15px] rounded-3xl right-0 border-none text-xl bg-[#2f74c0] transition-all text-white shadow-[0_0_10px_#000] hover:bg-[#388ae2] active:scale-[0.8]"
      >
        Go
      </button>
    </form>
  );
};
