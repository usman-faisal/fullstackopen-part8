import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const UpdateBirthForm = () => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const result = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onCompleted: (data) => {
      if (!data.editAuthor) {
        alert("No author found");
      }
    },
  });

  async function handleSubmit(e) {
    editAuthor({ variables: { name, born: Number.parseInt(born) } });

    e.preventDefault();
  }
  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <select
            onChange={(e) => setName(e.target.value)}
            required
            name="name"
            id="name"
          >
            <option value="">--Select Name--</option>
            {result.data.allAuthors.map((author) => (
              <option value={author.name} key={author.name}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="born">Born</label>
          <input
            type="number"
            required
            value={born}
            id="born"
            onChange={(e) => setBorn(e.target.value)}
          />
        </div>
        <button>Update Author</button>
      </form>
    </div>
  );
};

export default UpdateBirthForm;
