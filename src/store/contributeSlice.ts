import { Contribution } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface ContributeState {
  list: Contribution[];
  loading: boolean;
}

const initialState: ContributeState = {
  list: [],
  loading: false,
};

const contributeSlice = createSlice({
  name: 'contribute',
  initialState,
  reducers: {
    setContributeList: (state, action: PayloadAction<Contribution[]>) => {
      state.list = action.payload;
      state.loading = false;
    },
    clearContributeList: (state) => {
      state.list = [];
    },
    setContributeLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setContributeList, clearContributeList, setContributeLoading } = contributeSlice.actions;
export default contributeSlice.reducer;
