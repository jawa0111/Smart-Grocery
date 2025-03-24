import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { addInventory, updateInventory, getInventoryById } from "../api/api";

const InventoryForm = () => {
  const [inventory, setInventory] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    location: "Pantry",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const preFilledData = searchParams.get('data');
    if (preFilledData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(preFilledData));
        setInventory({
          ...parsedData,
          location: parsedData.location || "Pantry"
        });
      } catch (error) {
        console.error("Error parsing pre-filled data:", error);
        setError("Error loading pre-filled data");
      }
    } else if (id) {
      fetchInventoryDetails();
    }
  }, [id, searchParams]);

  const fetchInventoryDetails = async () => {
    try {
      setLoading(true);
      const response = await getInventoryById(id);
      setInventory({
        ...response.data,
        location: response.data.location || "Pantry"
      });
    } catch (error) {
      console.error("Error fetching inventory details:", error);
      setError("Error loading inventory details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInventory({ ...inventory, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = ['name', 'category', 'quantity', 'unit', 'expiryDate', 'location'];
      const missingFields = requiredFields.filter(field => !inventory[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Convert quantity to number
      const inventoryData = {
        ...inventory,
        quantity: Number(inventory.quantity)
      };

      if (id) {
        await updateInventory(id, inventoryData);
      } else {
        await addInventory(inventoryData);
      }
      navigate("/inventory");
    } catch (error) {
      console.error("Error saving inventory:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Error saving inventory item";
      setError(errorMessage);
      
      // If there are validation errors, display them
      if (error.response?.data?.details) {
        const validationErrors = Object.values(error.response.data.details)
          .map(err => err.message)
          .join(', ');
        setError(`${errorMessage}: ${validationErrors}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {id ? "Edit Item" : "Add New Item"}
            </h2>
            <Link
              to="/inventory"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={inventory.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Milk, Eggs, Bread"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={inventory.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Dairy, Produce, Pantry"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={inventory.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 2"
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={inventory.unit}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., kg, g, liters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={inventory.expiryDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Storage Location
              </label>
              <select
                id="location"
                name="location"
                value={inventory.location}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Pantry">Pantry</option>
                <option value="Fridge">Fridge</option>
                <option value="Freezer">Freezer</option>
                <option value="Cupboard">Cupboard</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={inventory.notes}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Any additional information..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link
                to="/inventory"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  id ? "Update Item" : "Add Item"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm; 