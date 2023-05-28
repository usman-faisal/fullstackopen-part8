import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const GenreList = ({ setGenre }) => {
  const result = useQuery(ALL_BOOKS);
  if (result.loading) return <p>Loading</p>;
  console.log(result.data);
  const allGenres = new Set(
    result.data.allBooks.map((book) => book.genres).flatMap((item) => item)
  );
  const handleGenreClick = (genre) => {
    localStorage.setItem("genre", genre);
    setGenre(genre);
  };
  return (
    <div className="genre-list">
      <button onClick={(e) => handleGenreClick(e.target.name)} name="">
        All genres
      </button>
      {[...allGenres].flatMap((genre) => {
        return (
          <button
            onClick={(e) => handleGenreClick(e.target.name)}
            name={genre}
            key={genre}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
};

export default GenreList;
