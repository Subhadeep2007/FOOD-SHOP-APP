import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../api/cartApi";

const getMessage = (error) => error.response && error.response.data && error.response.data.message ? error.response.data.message : "Unable to update cart.";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
    try { return await getCart(); } catch (error) { return rejectWithValue(getMessage(error)); }
});
export const addToCart = createAsyncThunk("cart/add", async ({ foodId, quantity }, { rejectWithValue }) => {
    try { return await addCartItem(foodId, quantity); } catch (error) { return rejectWithValue(getMessage(error)); }
});
export const changeCartQuantity = createAsyncThunk("cart/change", async ({ foodId, quantity }, { rejectWithValue }) => {
    try { return await updateCartItem(foodId, quantity); } catch (error) { return rejectWithValue(getMessage(error)); }
});
export const deleteCartItem = createAsyncThunk("cart/delete", async (foodId, { rejectWithValue }) => {
    try { return await removeCartItem(foodId); } catch (error) { return rejectWithValue(getMessage(error)); }
});
export const emptyCart = createAsyncThunk("cart/empty", async (_, { rejectWithValue }) => {
    try { await clearCart(); return { items: [] }; } catch (error) { return rejectWithValue(getMessage(error)); }
});

const applyCart = (state, action) => { state.cart = action.payload || { items: [] }; state.error = ""; };
const cartSlice = createSlice({
    name: "cart",
    initialState: { cart: { items: [] }, loading: false, updating: false, error: "" },
    reducers: { resetCart: (state) => { state.cart = { items: [] }; state.error = ""; } },
    extraReducers: (builder) => {
        builder.addCase(fetchCart.pending, (state) => { state.loading = true; state.error = ""; })
            .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; applyCart(state, action); })
            .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Unable to load cart."; })
            .addMatcher((action) => action.type.startsWith("cart/") && action.type.endsWith("/pending") && action.type !== "cart/fetch/pending", (state) => { state.updating = true; })
            .addMatcher((action) => action.type.startsWith("cart/") && action.type.endsWith("/fulfilled") && action.type !== "cart/fetch/fulfilled", (state, action) => { state.updating = false; applyCart(state, action); })
            .addMatcher((action) => action.type.startsWith("cart/") && action.type.endsWith("/rejected") && action.type !== "cart/fetch/rejected", (state, action) => { state.updating = false; state.error = action.payload || "Unable to update cart."; });
    }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
