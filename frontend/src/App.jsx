import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GroceryList from "./components/GroceryList";
import GroceryForm from "./components/GroceryForm";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<GroceryList />} />
                <Route path="/add" element={<GroceryForm />} />
                <Route path="/edit/:id" element={<GroceryForm />} />
            </Routes>
        </Router>
    );
}

export default App;
