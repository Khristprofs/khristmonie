import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"
import Home from "./components/Home"
import Login from "./components/auth/Login";


function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
      </Route>
    </Routes>
  )
}

export default App;