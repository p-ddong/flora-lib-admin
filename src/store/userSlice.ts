import { User2 } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface UserState {
  list: User2[];
  loading: boolean;
}

const initialState: UserState = {
  list: [],
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserList: (state, action: PayloadAction<User2[]>) => {
      state.list = action.payload;
      state.loading = false;
    },
    clearUserList: (state) => {
      state.list = [];
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setUserList, clearUserList, setUserLoading } = userSlice.actions;
export default userSlice.reducer;
