import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface KOL {
  id: string;
  displayName: string;
  avatar?: string;
  platforms: string[];
  followers: number;
  engagementRate: number;
  categories: string[];
  relevanceScore: number;
}

interface KOLState {
  kols: KOL[];
  selectedKOL: KOL | null;
  loading: boolean;
  searchFilters: {
    platforms?: string[];
    categories?: string[];
    minFollowers?: number;
    maxFollowers?: number;
    engagementRate?: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: KOLState = {
  kols: [],
  selectedKOL: null,
  loading: false,
  searchFilters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const kolSlice = createSlice({
  name: 'kol',
  initialState,
  reducers: {
    searchStart: (state) => {
      state.loading = true;
    },
    searchSuccess: (state, action: PayloadAction<{ kols: KOL[]; pagination: any }>) => {
      state.loading = false;
      state.kols = action.payload.kols;
      state.pagination = action.payload.pagination;
    },
    searchFailure: (state) => {
      state.loading = false;
      state.kols = [];
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.searchFilters = action.payload;
    },
    selectKOL: (state, action: PayloadAction<KOL>) => {
      state.selectedKOL = action.payload;
    },
  },
});

export const { searchStart, searchSuccess, searchFailure, setFilters, selectKOL } = kolSlice.actions;
export default kolSlice.reducer;