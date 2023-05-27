import React from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS, GET_FAVORITE_GENRE } from "../queries";
import BookList from "./BookList";

const RecommendedBooks = () => {
  const result = useQuery(GET_FAVORITE_GENRE);
  const resultBooks = useQuery(ALL_BOOKS, {
    variables: { genre: result?.data && result.data.me.favoriteGenre },
  });
  if (!resultBooks.data || !result.data) return null;
  if (result.loading) return <p>loading..</p>;
  console.log({ resultBooks });
  return (
    <div>
      <h2>books {result.data.me.favoriteGenre}</h2>
      <BookList books={resultBooks.data.allBooks} />
    </div>
  );
};

export default RecommendedBooks;
