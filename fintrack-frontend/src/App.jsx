import { useState } from "react";
import Login from "./components/Login";

function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("fintrack_token"))
  );

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  return <h1>Dashboard coming next...</h1>;
}

export default App;