import { api } from "./axios";

const unwrap = (response) => response.data && response.data.data ? response.data.data : response.data;
const getCart = async() => unwrap(await api.get("/cart"));
const addCartItem = async(foodId, quantity) => unwrap(await api.post("/cart/items", { foodId, quantity }));
const updateCartItem = async(foodId, quantity) => unwrap(await api.patch("/cart/items/" + foodId, { quantity }));
const removeCartItem = async(foodId) => unwrap(await api.delete("/cart/items/" + foodId));
const clearCart = async() => unwrap(await api.delete("/cart"));

export { getCart, addCartItem, updateCartItem, removeCartItem, clearCart };