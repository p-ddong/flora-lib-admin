import { PlantList } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface PlantState {
  list: PlantList[];
  loading: boolean;
}

const initialState: PlantState = {
  list: [],
  loading: false,
};

const plantSlice = createSlice({
  name: 'plant',
  initialState,
  reducers: {
    setPlantList: (state, action: PayloadAction<PlantList[]>) => {
      state.list = action.payload;
      state.loading = false;
    },
    clearPlantList: (state) => {
      state.list = [];
    },
    setPlantLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setPlantList, clearPlantList, setPlantLoading } = plantSlice.actions;
export default plantSlice.reducer;
