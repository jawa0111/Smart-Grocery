import axios from "axios";

const API_URL = "http://localhost:5000/api/groceries"; // Your backend URL

export const getGroceries = async () => axios.get(API_URL);
export const getGroceryById = async (id) => axios.get(`${API_URL}/${id}`);
export const addGrocery = async (grocery) => axios.post(API_URL, grocery);
export const updateGrocery = async (id, grocery) => axios.put(`${API_URL}/${id}`, grocery);
export const deleteGrocery = async (id) => axios.delete(`${API_URL}/${id}`);
