import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api.js';

const extractItems = (payload) => {
  if (Array.isArray(payload))        return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/wishlist');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/wishlist/add', { productId });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await API.delete(`/wishlist/remove/${productId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending,  (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = extractItems(action.payload);
      })
      .addCase(fetchWishlist.rejected,  (state) => { state.loading = false; })

      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = extractItems(action.payload);
      })

      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = extractItems(action.payload);
      });
  },
});

export default wishlistSlice.reducer;