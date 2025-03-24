import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GroceryList from "./components/GroceryList";
import GroceryForm from "./components/GroceryForm";
import InventoryList from "./components/InventoryList";
import InventoryForm from "./components/InventoryForm";
import Login from "./components/Login";
import Register from "./components/Register";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Navigation Component
const Navigation = () => {
    const { user, logout } = useAuth();
    
    return (
        <nav className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-white">
                                Inventory Manager
                            </Link>
                        </div>
                        {user && (
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/"
                                    className="border-transparent text-gray-100 hover:bg-blue-700 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Groceries
                                </Link>
                                {user.role === 'inventory_manager' && (
                                    <Link
                                        to="/inventory"
                                        className="border-transparent text-gray-100 hover:bg-blue-700 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Inventory
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-100">
                                    {user.name} ({user.role})
                                </span>
                                <button
                                    onClick={logout}
                                    className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <Routes>
                            {/* Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            
                            {/* Protected Routes */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <GroceryList />
                                </ProtectedRoute>
                            } />
                            <Route path="/add" element={
                                <ProtectedRoute>
                                    <GroceryForm />
                                </ProtectedRoute>
                            } />
                            <Route path="/edit/:id" element={
                                <ProtectedRoute>
                                    <GroceryForm />
                                </ProtectedRoute>
                            } />
                            <Route path="/inventory" element={
                                <ProtectedRoute allowedRoles={['inventory_manager']}>
                                    <InventoryList />
                                </ProtectedRoute>
                            } />
                            <Route path="/inventory/add" element={
                                <ProtectedRoute allowedRoles={['inventory_manager']}>
                                    <InventoryForm />
                                </ProtectedRoute>
                            } />
                            <Route path="/inventory/edit/:id" element={
                                <ProtectedRoute allowedRoles={['inventory_manager']}>
                                    <InventoryForm />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
