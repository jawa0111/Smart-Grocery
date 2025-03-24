import { useEffect, useState } from "react";
import { getInventory, deleteInventory } from "../api/api";
import { Link } from "react-router-dom";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const response = await getInventory();
    setInventory(response.data);
  };

  const handleDelete = async (id) => {
    await deleteInventory(id);
    fetchInventory();
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (days) => {
    if (days < 0) return "expired";
    if (days <= 7) return "expiring-soon";
    if (days <= 30) return "expiring-month";
    return "good";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
        <Link 
          to="/inventory/add" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Item
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => {
          const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
          const expiryStatus = getExpiryStatus(daysUntilExpiry);
          
          return (
            <div 
              key={item._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-indigo-600 font-medium">{item.category}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    expiryStatus === "expired" ? "bg-red-100 text-red-800" :
                    expiryStatus === "expiring-soon" ? "bg-yellow-100 text-yellow-800" :
                    expiryStatus === "expiring-month" ? "bg-orange-100 text-orange-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {daysUntilExpiry < 0 ? "Expired" :
                     daysUntilExpiry === 0 ? "Expires today" :
                     daysUntilExpiry === 1 ? "Expires tomorrow" :
                     `${daysUntilExpiry} days left`}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} {item.unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expiry Date: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                  {item.location && (
                    <p className="text-sm text-gray-500">
                      Location: {item.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <Link
                  to={`/inventory/edit/${item._id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryList; 