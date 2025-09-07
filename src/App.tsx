import { useEffect, useState } from "react";
import initSqlJs, { Database, QueryExecResult } from "sql.js";

const SQL_WASM_PATH = "/sql-wasm.wasm";

function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryExecResult[] | null>(null);
  const [status, setStatus] = useState<{ msg: string; type: "success" | "error" | "" }>({
    msg: "",
    type: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const SQL = await initSqlJs({ locateFile: () => SQL_WASM_PATH });
        const database = new SQL.Database();
        database.exec(`
          CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
          INSERT INTO departments (id, name) VALUES (1, 'Engineering'), (2, 'Marketing'), (3, 'Sales');
          CREATE TABLE employees (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            department_id INTEGER,
            salary INTEGER,
            FOREIGN KEY (department_id) REFERENCES departments(id)
          );
          INSERT INTO employees (id, name, department_id, salary) VALUES
            (1, 'Alice Johnson', 1, 75000),
            (2, 'Bob Smith', 1, 82000),
            (3, 'Charlie Brown', 2, 65000),
            (4, 'Diana Miller', 3, 90000),
            (5, 'Eve Davis', 1, 78000),
            (6, 'Frank White', 2, 68000);
        `);
        setDb(database);
      } catch (err: any) {
        setStatus({ msg: "Failed to load SQL WASM: " + err.message, type: "error" });
      }
    })();
  }, []);

  const runQuery = () => {
    if (!db) return;
    try {
      const res = db.exec(query);
      setResults(res);
      setStatus({ msg: "Query executed successfully.", type: "success" });
    } catch (e: any) {
      setResults(null);
      setStatus({ msg: e.message, type: "error" });
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>SQL Tester App</h1>
      <textarea
        style={{ width: "100%", minHeight: 80, fontFamily: "monospace" }}
        placeholder="Write your SQL query here, e.g. SELECT * FROM employees;"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button style={{ marginTop: 10 }} onClick={runQuery} disabled={!db}>
        Run Query
      </button>
      {status.msg && (
        <div
          style={{
            marginTop: 10,
            color: status.type === "success" ? "green" : "red",
          }}
        >
          {status.msg}
        </div>
      )}
      <div style={{ marginTop: 20 }}>
        {results && results.length > 0 && results[0].values.length > 0 ? (
          <table
            border={1}
            cellPadding={6}
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                {results[0].columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results[0].values.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell as string}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#888" }}>Query results will appear here.</p>
        )}
      </div>
    </div>
  );
}

export default App;
