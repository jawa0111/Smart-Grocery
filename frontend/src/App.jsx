import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import GroceryList from "./components/GroceryList";
import GroceryForm from "./components/GroceryForm";
import InventoryList from "./components/InventoryList";
import InventoryForm from "./components/InventoryForm";

// Navigation Component
const Navigation = () => {
    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-indigo-600">
                                Inventory Manager
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Groceries
                            </Link>
                            <Link
                                to="/inventory"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Inventory
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navigation />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<GroceryList />} />
                        <Route path="/add" element={<GroceryForm />} />
                        <Route path="/edit/:id" element={<GroceryForm />} />
                        <Route path="/inventory" element={<InventoryList />} />
                        <Route path="/inventory/add" element={<InventoryForm />} />
                        <Route path="/inventory/edit/:id" element={<InventoryForm />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
