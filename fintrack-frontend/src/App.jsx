import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("fintrack_token"))
  );

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard />;
}

export default App;