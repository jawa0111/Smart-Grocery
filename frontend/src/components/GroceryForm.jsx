import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addGrocery, updateGrocery, getGroceryById } from "../api/api";

const GroceryForm = () => {
  const [grocery, setGrocery] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    price: "",
    storeName: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) fetchGroceryDetails();
  }, [id]);

  const fetchGroceryDetails = async () => {
    const response = await getGroceryById(id);
    setGrocery(response.data);
  };

  const handleChange = (e) => {
    setGrocery({ ...grocery, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      id ? await updateGrocery(id, grocery) : await addGrocery(grocery);
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">
        {id ? "Edit Grocery" : "Add Grocery"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Name"
          value={grocery.name} onChange={handleChange} required
          className="w-full p-3 border rounded-lg"
        />
        <input type="text" name="category" placeholder="Category"
          value={grocery.category} onChange={handleChange} required
          className="w-full p-3 border rounded-lg"
        />
        <input type="number" name="quantity" placeholder="Quantity"
          value={grocery.quantity} onChange={handleChange} required
          className="w-full p-3 border rounded-lg"
        />
        <input type="text" name="unit" placeholder="Unit (kg, g, liters)"
          value={grocery.unit} onChange={handleChange} required
          className="w-full p-3 border rounded-lg"
        />
        <input type="number" name="price" placeholder="Price per unit"
          value={grocery.price} onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <input type="text" name="storeName" placeholder="Store Name"
          value={grocery.storeName} onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <button type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
          {id ? "Update" : "Add"} Grocery
        </button>
      </form>
    </div>
  );
};

export default GroceryForm;
