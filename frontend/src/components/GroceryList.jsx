import { useEffect, useState } from "react";
import { getGroceries, deleteGrocery } from "../api/api";
import { Link } from "react-router-dom";

const GroceryList = () => {
  const [groceries, setGroceries] = useState([]);

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

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Grocery List</h2>
      <Link to="/add" className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 block text-center hover:bg-green-600">
        + Add New Grocery
      </Link>
      <ul className="space-y-4">
        {groceries.map((grocery) => (
          <li key={grocery._id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
            <div>
              <h3 className="text-lg font-semibold">{grocery.name}</h3>
              <p className="text-sm text-gray-500">{grocery.category}</p>
              <p className="text-sm">Quantity: {grocery.quantity} {grocery.unit}</p>
            </div>
            <div className="flex space-x-3">
              <Link to={`/edit/${grocery._id}`} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
                Edit
              </Link>
              <button onClick={() => handleDelete(grocery._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroceryList;
