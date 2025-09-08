// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "users",
  initialState: {
    // danh sách (cho admin)
    list: { items: [], isFetching: false, error: null, page: 1, limit: 20, total: 0 },
    // hồ sơ của chính mình (cho user thường)
    me:   { profile: null, isFetching: false, error: null },
    msg:"",
  },
  reducers: {
    // ------- LIST (admin) -------
    getUsersStart:   (s) => { s.list.isFetching = true; s.list.error = null; },
    getUsersSuccess: (s, a) => {
      s.list.isFetching = false;
      const payload = a.payload || {};
      s.list.items = Array.isArray(payload) ? payload : (payload.items || []);
      s.list.page  = payload.page  ?? s.list.page;
      s.list.limit = payload.limit ?? s.list.limit;
      s.list.total = payload.total ?? s.list.total;
    },
    getUsersFail: (s, a) => { s.list.isFetching = false; s.list.error = a.payload || "error"; },

    // ------- ME (self) -------
    getMeStart:   (s) => { 
      s.me.isFetching = true; 
      s.me.error = null; 
    },
    getMeSuccess: (s, a) => { 
      s.me.isFetching = false; 
      s.me.profile = a.payload; 
    },
    getMeFail: (s, a) => { 
      s.me.isFetching = false; 
      s.me.error = a.payload || "error"; 
    },
    deleteUserStart: (s) => { 
      s.me.isFetching = true; 
      s.me.error = null; 
    },
    deleteUserSuccess: (s, a) => { 
      s.me.isFetching = false; 
      s.me.profile = null; 
      s.msg = a.payload || "Deleted successfully";
    },
    deleteUserFail: (s, a) => { 
      s.me.isFetching = false; 
      s.me.error = true; 
      s.msg = a.payload || "error";
    },
  },
});

export const {
  getUsersStart, getUsersSuccess, getUsersFail,
  getMeStart, getMeSuccess, getMeFail,
  deleteUserStart, deleteUserSuccess, deleteUserFail,
} = userSlice.actions;

export default userSlice.reducer;
