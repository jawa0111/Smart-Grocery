import { useEffect, useState } from "react";
import { getInventory, deleteInventory, getInventoryReport } from "../api/api";
import { Link } from "react-router-dom";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate total quantity by category
  const categoryCounts = filteredInventory.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += item.quantity || 0;
    return acc;
  }, {});

  // Calculate expiry risk in terms of quantity
  const getExpiryRiskCount = () => {
    const today = new Date();
    const riskCount = filteredInventory.reduce((sum, item) => {
      if (!item.expiryDate) return sum;
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      // Calculate risk based on days remaining
      if (daysUntilExpiry <= 7) {
        return sum + (item.quantity || 0);
      }
      return sum;
    }, 0);
    return riskCount;
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    setFilteredInventory(searchQuery ? 
      inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : inventory
    );
  }, [inventory, searchQuery]);

  const fetchInventory = async () => {
    const response = await getInventory();
    setInventory(response.data);
  };

  const handleDelete = async (id) => {
    await deleteInventory(id);
    fetchInventory();
  };

  const handleGenerateReport = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to generate reports');
        return;
      }

      console.log('Requesting inventory report...');
      const response = await getInventoryReport();
      console.log('Report received:', response.data);
      
      // Create a formatted report string
      let reportText = `Smart Grocery Inventory Report\n`;
      reportText += `========================\n\n`;
      
      // Summary Section
      reportText += `INVENTORY SUMMARY\n`;
      reportText += `----------------\n`;
      reportText += `Total Items: ${response.data.totalItems}\n`;
      reportText += `Low Stock Items: ${response.data.inventoryStatus.lowStock}\n`;
      reportText += `Expiring Soon: ${response.data.inventoryStatus.expiringSoon}\n`;
      reportText += `Out of Stock: ${response.data.inventoryStatus.outOfStock}\n\n`;
      
      // Category Breakdown
      reportText += `CATEGORY BREAKDOWN\n`;
      reportText += `-----------------\n`;
      response.data.categoryBreakdown.forEach(category => {
        reportText += `\n${category.category} (${category.itemCount} items)\n`;
        reportText += `------------------\n`;
        category.items.forEach(item => {
          reportText += `- ${item.name}:\n`;
          reportText += `  Quantity: ${item.quantity} ${item.unit}\n`;
          reportText += `  Location: ${item.location}\n`;
          if (item.expiryDate) {
            reportText += `  Expiry Date: ${new Date(item.expiryDate).toLocaleDateString()}\n`;
          }
          if (item.needsRestock) {
            reportText += `  ⚠️ Needs restock\n`;
          }
          if (item.expiringSoon) {
            reportText += `  ⚠️ Expiring soon\n`;
          }
          reportText += '\n';
        });
      });

      reportText += `\nReport generated on: ${new Date(response.data.lastUpdated).toLocaleString()}\n`;

      // Create and download the report file
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.txt`;
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
        if (error.response.status === 401) {
          errorMessage = 'Please log in to generate reports';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to generate reports';
        } else if (error.response.status === 500) {
          const errorDetails = error.response.data?.error || {};
          errorMessage = `Server error: ${errorDetails.message || 'Unknown error'}`;
          if (errorDetails.name) {
            errorMessage += ` (${errorDetails.name})`;
          }
          if (errorDetails.code) {
            errorMessage += ` [${errorDetails.code}]`;
          }
          console.error('Server error details:', errorDetails);
        } else {
          errorMessage = error.response.data?.message || 'Failed to generate report. Please try again.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Failed to generate report. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Counts</h3>
          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{category}</span>
                <span className="font-medium text-indigo-600">{count} items</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expiry Risk</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Items expiring within 7 days</span>
              <span className="font-medium text-red-600">{getExpiryRiskCount()} items</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory items..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
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
          <Link to="/inventory/add" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => {
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