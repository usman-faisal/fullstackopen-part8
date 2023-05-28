import { useState } from "react";
import Authors from "./components/Authors";
import AllBooks from "./components/AllBooks";
import NewBook from "./components/NewBook";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { Link } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import { useApolloClient, useSubscription } from "@apollo/client";
import RecommendedBooks from "./components/RecommendedBooks";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";

const App = () => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const { bookAdded } = data.data;
      window.alert(`new book added by ${bookAdded.author.name}`);
      client.cache.updateQuery(
        {
          query: ALL_BOOKS,
          variables: { genre: localStorage.getItem("genre") ?? null },
        },
        ({ allBooks }) => {
          console.log({ allBooks });
          return {
            allBooks: allBooks.concat(bookAdded),
          };
        }
      );
    },
  });
  async function handleLogoutClick() {
    setToken(null);
    localStorage.removeItem("token");
    await client.resetStore();
  }
  return (
    <div>
      <div className="nav">
        <Link to="authors">authors</Link>
        <Link to="books">books</Link>
        <Link to="add">add book</Link>

        {token ? (
          <>
            <button onClick={handleLogoutClick}>Logout</button>
            <Link to="recommended">Recommended</Link>
          </>
        ) : (
          <Link to="login">Login</Link>
        )}
      </div>
      <Routes>
        <Route element={<Authors />} path="authors" />
        <Route element={<AllBooks />} path="books" />
        <Route element={<NewBook />} path="add" />
        {token && <Route element={<RecommendedBooks />} path="recommended" />}
        {!token && (
          <Route element={<LoginForm setToken={setToken} />} path="login" />
        )}
      </Routes>
    </div>
  );
};

export default App;
