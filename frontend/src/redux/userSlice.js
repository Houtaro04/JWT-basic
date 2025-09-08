import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: {
    items: [],
    page: 1,
    limit: 20,
    total: 0,
    isFetching: false,
    error: null,
    status: null,
  },
  msg: null,      // thông điệp hiển thị tạm thời
  msgType: null,  // 'success' | 'error'
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // ----- LIST -----
    getUsersStart: (s) => {
      s.list.isFetching = true;
      s.list.error = null;
      s.list.status = null;
    },
    getUsersSuccess: (s, { payload }) => {
      s.list.isFetching = false;
      s.list.items  = payload.items || [];
      s.list.page   = payload.page  ?? 1;
      s.list.limit  = payload.limit ?? 20;
      s.list.total  = payload.total ?? s.list.items.length;
      s.list.error  = null;
      s.list.status = 200;
    },
    getUsersFail: (s, { payload }) => {
      s.list.isFetching = false;
      s.list.error  = payload?.message || "Lỗi tải danh sách";
      s.list.status = payload?.status ?? null;
    },

    // ----- DELETE -----
    deleteUserStart: (s) => {
      s.list.isFetching = true;
      s.list.status = null;
    },
    deleteUserSuccess: (s, { payload }) => {
      s.list.isFetching = false;
      const id = payload?.id;
      const victim = s.list.items.find(u => u._id === id);
      s.list.items = s.list.items.filter(u => u._id !== id);
      s.msg = victim ? `Đã xoá: ${victim.username}` : "Đã xoá";
      s.msgType = "success";
    },
    deleteUserFail: (s, { payload }) => {
      s.list.isFetching = false;
      s.list.error  = payload?.message || "Xoá thất bại";
      s.list.status = payload?.status ?? null;
      s.msg = s.list.error;
      s.msgType = "error";
    },

    // ----- MESSAGE -----
    setMsg: (s, { payload }) => {
      s.msg = payload?.message || String(payload || "");
      s.msgType = payload?.type || "error";
    },
    clearMsg: (s) => { s.msg = null; s.msgType = null; },
  },
});

export const {
  getUsersStart, getUsersSuccess, getUsersFail,
  deleteUserStart, deleteUserSuccess, deleteUserFail,
  setMsg, clearMsg,
} = userSlice.actions;

export default userSlice.reducer;
