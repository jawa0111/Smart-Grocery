import { useEffect, useState } from "react";
import { getGroceries, deleteGrocery } from "../api/api";
import { Link, useNavigate } from "react-router-dom";

const GroceryList = () => {
  const [groceries, setGroceries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroceries();
  }, []);

  const fetchGroceries = async () => {
    const response = await getGroceries();
    setGroceries(response.data);
  };

  const handleDelete = async (id) => {
    await deleteGrocery(id);
    fetchGroceries();
  };

  const handleAddToInventory = (grocery) => {
    // Convert grocery item to inventory format
    const inventoryItem = {
      name: grocery.name,
      category: grocery.category,
      quantity: grocery.quantity,
      unit: grocery.unit,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days expiry
      location: "Pantry", // Default location
      notes: `Added from grocery list. Original price: ${grocery.price || 'N/A'} per ${grocery.unit}`
    };
    
    // Navigate to inventory form with pre-filled data
    navigate(`/inventory/add?data=${encodeURIComponent(JSON.stringify(inventoryItem))}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Grocery List</h2>
        <Link to="/add" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Item
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groceries.map((grocery) => (
          <div 
            key={grocery._id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{grocery.name}</h3>
                  <p className="mt-1 text-sm text-indigo-600 font-medium">{grocery.category}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {grocery.quantity} {grocery.unit}
                </span>
              </div>
              
              {grocery.price && (
                <p className="mt-2 text-sm text-gray-500">
                  Price: LKR {grocery.price} per {grocery.unit}
                </p>
              )}
              
              {grocery.storeName && (
                <p className="mt-1 text-sm text-gray-500">
                  Store: {grocery.storeName}
                </p>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => handleAddToInventory(grocery)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Add to Inventory
              </button>
              <Link
                to={`/edit/${grocery._id}`}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => handleDelete(grocery._id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroceryList;
