import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, result] = useMutation(LOGIN);
  const navigate = useNavigate();
  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("token", token);
      navigate("/books", { replace: true });
    }
  }, [result.data]);
  async function handleSubmit(e) {
    e.preventDefault();
    await login({ variables: { username, password } });
  }
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          id="username"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          id="password"
        />
      </div>
      <button>Login</button>
    </form>
  );
};

export default LoginForm;
