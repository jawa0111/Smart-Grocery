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
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
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
        setApiError("Error loading pre-filled data");
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
      setApiError("Error loading inventory details");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!inventory.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (inventory.name.length < 2) {
      newErrors.name = 'Item name must be at least 2 characters long';
    }

    // Category validation
    if (!inventory.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (inventory.category.length < 2) {
      newErrors.category = 'Category must be at least 2 characters long';
    }

    // Quantity validation
    if (!inventory.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(inventory.quantity) || Number(inventory.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number';
    }

    // Unit validation
    if (!inventory.unit.trim()) {
      newErrors.unit = 'Unit is required';
    } else if (inventory.unit.length < 1) {
      newErrors.unit = 'Unit must be at least 1 character long';
    }

    // Expiry date validation
    if (!inventory.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const selectedDate = new Date(inventory.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expiryDate = 'Expiry date cannot be in the past';
      }
    }

    // Location validation
    const validLocations = ["Pantry", "Fridge", "Freezer", "Cupboard", "Other"];
    if (!validLocations.includes(inventory.location)) {
      newErrors.location = 'Invalid storage location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInventory(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
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
      setApiError(errorMessage);
      
      // If there are validation errors, display them
      if (error.response?.data?.details) {
        const validationErrors = Object.values(error.response.data.details)
          .map(err => err.message)
          .join(', ');
        setApiError(`${errorMessage}: ${validationErrors}`);
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

          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{apiError}</p>
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
                className={`mt-1 block w-full rounded-md ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                placeholder="e.g., Milk, Eggs, Bread"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
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
                className={`mt-1 block w-full rounded-md ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                placeholder="e.g., Dairy, Produce, Pantry"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
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
                  className={`mt-1 block w-full rounded-md ${
                    errors.quantity ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                  placeholder="e.g., 2"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
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
                  className={`mt-1 block w-full rounded-md ${
                    errors.unit ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                  placeholder="e.g., kg, g, liters"
                />
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                )}
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
                className={`mt-1 block w-full rounded-md ${
                  errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
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
                className={`mt-1 block w-full rounded-md ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
              >
                <option value="Pantry">Pantry</option>
                <option value="Fridge">Fridge</option>
                <option value="Freezer">Freezer</option>
                <option value="Cupboard">Cupboard</option>
                <option value="Other">Other</option>
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
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