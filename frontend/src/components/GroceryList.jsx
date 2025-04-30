import { useEffect, useState } from "react";
import { getGroceries, deleteGrocery, getGroceryReport } from "../api/api";
import { Link, useNavigate } from "react-router-dom";

const GroceryList = () => {
  const [groceries, setGroceries] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerateReport = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      const response = await getGroceryReport();
      setReport(response.data);
      
      // Create a formatted report string
      let reportText = `Smart Grocery Shopping Report\n`;
      reportText += `========================\n\n`;
      
      // Current Grocery List Section
      reportText += `CURRENT GROCERY LIST\n`;
      reportText += `------------------\n`;
      reportText += `Total Items: ${response.data.totalItems}\n`;
      reportText += `Total Cost: LKR ${response.data.totalCost.toFixed(2)}\n\n`;
      
      response.data.categories.forEach(category => {
        reportText += `${category.category} (${category.itemCount} items)\n`;
        reportText += `------------------\n`;
        category.items.forEach(item => {
          reportText += `- ${item.name}: ${item.quantity} ${item.unit}`;
          if (item.price) {
            reportText += ` (LKR ${item.price} per ${item.unit})`;
          }
          if (item.storeName) {
            reportText += ` - Store: ${item.storeName}`;
          }
          reportText += '\n';
        });
        reportText += '\n';
      });

      // Inventory Needs Section
      if (response.data.inventoryNeeds.length > 0) {
        reportText += `\nINVENTORY NEEDS\n`;
        reportText += `--------------\n`;
        reportText += `Items that need attention:\n\n`;

        response.data.inventoryNeeds.forEach(category => {
          reportText += `${category.category} (${category.itemCount} items)\n`;
          reportText += `------------------\n`;
          category.items.forEach(item => {
            reportText += `- ${item.name}:\n`;
            reportText += `  Current: ${item.currentQuantity} ${item.unit}\n`;
            reportText += `  Typical: ${item.typicalQuantity} ${item.unit}\n`;
            if (item.needsRestock) {
              reportText += `  ⚠️ Needs restock\n`;
            }
            if (item.expiringSoon) {
              reportText += `  ⚠️ Expiring on: ${new Date(item.expiryDate).toLocaleDateString()}\n`;
            }
            reportText += '\n';
          });
        });
      }

      // Create and download the report file
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-grocery-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      let errorMessage = 'Failed to generate report. ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Grocery List</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </>
            )}
          </button>
          <Link to="/add" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </Link>
        </div>
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
