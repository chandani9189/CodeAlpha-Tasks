import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api.js';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (item, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/cart/add', item);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await API.delete(`/cart/remove/${itemId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const updateQuantity = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/cart/update/${itemId}`, { quantity });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    // Instantly update quantity in UI without waiting for backend
    optimisticUpdate: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i._id === itemId);
      if (item) item.quantity = quantity;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        // Sync with backend response after optimistic update
        state.items = action.payload.items || [];
      });
  },
});

export const { optimisticUpdate } = cartSlice.actions;
export default cartSlice.reducer;