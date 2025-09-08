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
    getUsersFail: (s, a) => {
      s.list.isFetching = false;
      // ép lỗi về string
      s.list.error  = a.payload?.message || a.payload || "Đã có lỗi";
      s.list.status = a.payload?.status;
    },

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
      s.me.error  = a.payload?.message || a.payload || "Đã có lỗi";
      s.me.status = a.payload?.status;
    },
    deleteUserStart:   (s) => { s.msg = null; s.msgType = null; },
    deleteUserSuccess: (s, a) => {
      const { id } = a.payload || {};
      // tìm username trước khi xoá để in thông báo đẹp
      const victim = s.list.items.find(u => u._id === id);
      s.list.items = s.list.items.filter(u => u._id !== id);
      s.msg = `Đã xoá user "${victim?.username ?? id}" thành công.`;
      s.msgType = "success";
    },
    deleteUserFail: (s, a) => {
      s.msg = a.payload?.message || "Xoá user thất bại.";
      s.msgType = "error";
    },
    clearMsg: (s) => { s.msg = null; s.msgType = null; },
  },
});

export const {
  getUsersStart, getUsersSuccess, getUsersFail,
  getMeStart, getMeSuccess, getMeFail,
  deleteUserStart, deleteUserSuccess, deleteUserFail, clearMsg,
} = userSlice.actions;

export default userSlice.reducer;
