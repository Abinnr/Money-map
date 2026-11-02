import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Categories from "./components/Categories";
import Budgets from "./components/Budgets";
import "./App.css";

function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("fintrack_token"))
  );
  const [page, setPage] = useState("dashboard");

  function handleLogout() {
    localStorage.removeItem("fintrack_token");
    setAuthenticated(false);
    setPage("dashboard");
  }

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <>
      <header className="app-header">
        <strong>FinTrack</strong>

        <nav>
          <button
            className={page === "dashboard" ? "nav-active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={page === "transactions" ? "nav-active" : ""}
            onClick={() => setPage("transactions")}
          >
            Transactions
          </button>

          <button
            className={page === "budgets" ? "nav-active" : ""}
            onClick={() => setPage("budgets")}
          >
            Budgets
          </button>

          <button
            className={page === "categories" ? "nav-active" : ""}
            onClick={() => setPage("categories")}
          >
            Categories
          </button>
          <button onClick={handleLogout}>Logout</button>


          
        </nav>
      </header>

      {page === "dashboard" ? (
        <Dashboard />
      ) : page === "transactions" ? (
        <Transactions />
      ) : page === "categories" ? (
        <Categories />
      ) : (
        <Budgets />
      )}
    </>
  );
}

export default App;
