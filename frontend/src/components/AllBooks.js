import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import GenreList from "./GenreList";
import React, { useState } from "react";
import BookList from "./BookList";

const AllBooks = () => {
  const [genre, setGenre] = useState("");
  const result = useQuery(ALL_BOOKS, {
    variables: { genre: localStorage.getItem("genre") ?? null },
  });
  if (result.loading) {
    return <p>Loading...</p>;
  }
  if (result.error) return null;
  return (
    <div>
      <h2>books</h2>
      <BookList books={result.data.allBooks} setGenre={setGenre} />
      <GenreList setGenre={setGenre} />
    </div>
  );
};

export default AllBooks;
