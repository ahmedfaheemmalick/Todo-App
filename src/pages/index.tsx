import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";

const GET_TODOS = gql`
  {
    todos {
      todo
    }
  }
`;

const ADD_TODOS = gql`
  mutation addTodo($todo: String!) {
    addTodo(todo: $todo) {
      todo
    }
  }
`;

interface todo {
  id: number,
  todo: string
}

const Home = () => {
  const [input, setInput] = useState("");

  const { loading, error, data } = useQuery(GET_TODOS);

  loading && <h1>Loading...</h1>;
  error && <h1>Error...</h1>;

  const [addTodo] = useMutation(ADD_TODOS);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      addTodo({
        variables: {
          todo: input,
        },
        refetchQueries: [{ query: GET_TODOS }],
      });
      setInput("");
    }
  };

  return (
    <div>
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button>Add Todo</button>
      </form>
      <ul>
        {data &&
          data.todos.map((todo: todo, index: number) => <li key={index}>{todo.todo}</li>)}
      </ul>
    </div>
  );
};

export default Home;
