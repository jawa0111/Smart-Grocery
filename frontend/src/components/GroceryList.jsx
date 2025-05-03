import { useEffect, useState } from "react";
import { getGroceries, deleteGrocery, getGroceryReport } from "../api/api";
import { Link, useNavigate } from "react-router-dom";

const GroceryList = () => {
  const [groceries, setGroceries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroceries, setFilteredGroceries] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Calculate total cost of groceries
  const totalCost = filteredGroceries.reduce((sum, grocery) => {
    return sum + (grocery.price || 0) * (grocery.quantity || 0);
  }, 0);

  useEffect(() => {
    fetchGroceries();
  }, []);

  const fetchGroceries = async () => {
    try {
      const response = await getGroceries();
      setGroceries(response.data);
      setFilteredGroceries(response.data);
    } catch (err) {
      console.error("Error fetching groceries:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGrocery(id);
      fetchGroceries();
    } catch (err) {
      console.error("Error deleting grocery:", err);
    }
  };

  const handleAddToInventory = (grocery) => {
    const inventoryItem = {
      name: grocery.name,
      category: grocery.category,
      quantity: grocery.quantity,
      unit: grocery.unit,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      location: "Pantry",
      notes: `Added from grocery list. Original price: ${
        grocery.price || "N/A"
      } per ${grocery.unit}`,
    };

    navigate(
      `/inventory/add?data=${encodeURIComponent(JSON.stringify(inventoryItem))}`
    );
  };

  const handleGenerateReport = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      const response = await getGroceryReport();
      setReport(response.data);
  
      let reportText = `Smart Grocery Shopping Report\n`;
      reportText += `========================\n\n`;
  
      // Current Grocery List Section
      reportText += `CURRENT GROCERY LIST\n`;
      reportText += `------------------\n`;
      reportText += `Total Items: ${response.data.totalItems || 0}\n`;
      reportText += `Total Cost: LKR ${(response.data.totalCost || 0).toFixed(2)}\n\n`;
  
      // Only loop if categories exists and is an array
      if (Array.isArray(response.data.categories)) {
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
      } else {
        reportText += `No categorized items found.\n\n`;
      }
  
      // Inventory Needs Section
      if (response?.data?.inventoryNeeds && Array.isArray(response.data.inventoryNeeds) && response.data.inventoryNeeds.length > 0) {
        reportText += `\nINVENTORY NEEDS\n`;
        reportText += `--------------\n`;
        reportText += `Items that need attention:\n\n`;
  
        response.data.inventoryNeeds.forEach(category => {
          if (!category || !category.category || !Array.isArray(category.items)) {
            return;
          }
          reportText += `${category.category} (${category.itemCount} items)\n`;
          reportText += `------------------\n`;
          
          category.items.forEach(item => {
            if (!item || !item.name || !item.currentQuantity || !item.unit) {
              return;
            }
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
        errorMessage += error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
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
        <div
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              setSearchQuery(query);
              const filtered = groceries.filter(grocery => 
                grocery.name.toLowerCase().includes(query)
              );
              setFilteredGroceries(filtered);
            }}
            placeholder="Search groceries..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Grocery List</h2>
            <p className="text-muted">Total Cost: LKR {totalCost.toFixed(2)}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generate Report
                </>
              )}
            </button>

            <Link
              to="/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Item
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroceries.map((grocery) => (
            <div
              key={grocery._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {grocery.name}
                    </h3>
                    <p className="mt-1 text-sm text-indigo-600 font-medium">
                      {grocery.category}
                    </p>
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
                  Add to Inventory
                </button>

                <Link
                  to={`/edit/${grocery._id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(grocery._id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroceryList;
