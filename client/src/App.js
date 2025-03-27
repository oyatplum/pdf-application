import "./App.css";
import React, { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  return <div className="App">Test</div>;
}

export default App;
