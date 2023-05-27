import React from "react";
import GenreList from "./GenreList";

const BookList = ({ books }) => {
  return (
    <table>
      <tbody>
        <tr>
          <th>Title</th>
          <th>author</th>
          <th>published</th>
        </tr>
        {books.map((a) => (
          <tr key={a.title}>
            <td>{a.title}</td>
            <td>{a.author.name}</td>
            <td>{a.published}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BookList;
