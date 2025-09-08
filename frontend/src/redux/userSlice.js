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
  msgType: null,  // 'success' | 'error' | 'info'
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
      const items = Array.isArray(payload) ? payload : (payload?.items || []);
      s.list.isFetching = false;
      s.list.items  = items;
      s.list.page   = payload?.page  ?? 1;
      s.list.limit  = payload?.limit ?? 20;
      s.list.total  = payload?.total ?? items.length;
      s.list.error  = null;
      s.list.status = 200;
    },
    getUsersFail: (s, { payload }) => {
      const message = payload?.message || "Lỗi tải danh sách";
      s.list.isFetching = false;
      s.list.error  = message;
      s.list.status = payload?.status ?? null;
      // tuỳ bạn: cũng show ra msg cho dễ nhìn
      s.msg = message;
      s.msgType = "error";
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
      s.list.total = Math.max(0, (s.list.total || 0) - 1);
      s.msg = victim ? `Đã xoá: ${victim.username}` : "Đã xoá";
      s.msgType = "success";
      s.list.error = null;
      s.list.status = 200;
    },
    deleteUserFail: (s, { payload }) => {
      const message = payload?.message || "Xoá thất bại";
      s.list.isFetching = false;
      s.list.error  = message;
      s.list.status = payload?.status ?? null;
      s.msg = message;
      s.msgType = "error";
    },

    // ----- MESSAGE -----
    // Hỗ trợ gọi: setMsg({ text: "...", type: "error" }) hoặc setMsg("...") (mặc định info)
    setMsg: (s, { payload }) => {
      if (typeof payload === "string") {
        s.msg = payload;
        s.msgType = "info";
      } else {
        s.msg = payload?.text ?? payload?.message ?? null;
        s.msgType = payload?.type || "info";
      }
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
