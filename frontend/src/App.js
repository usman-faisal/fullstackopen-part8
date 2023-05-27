import { useState } from "react";
import Authors from "./components/Authors";
import AllBooks from "./components/AllBooks";
import NewBook from "./components/NewBook";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { Link } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import { useApolloClient } from "@apollo/client";
import RecommendedBooks from "./components/RecommendedBooks";

const App = () => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const client = useApolloClient();
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
