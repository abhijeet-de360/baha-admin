import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { setLoading } from "./loader";
import { service } from "@/shared/_services/api_services";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";

export const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
} as const);

export type BlogStatus = (typeof STATUS)[keyof typeof STATUS];

export interface BlogItem {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  imageFileId?: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogState {
  blogs: BlogItem[];
  status: BlogStatus;
  total: number;
  blogDetails: BlogItem | null;
}

const initialState: BlogState = {
  blogs: [],
  status: STATUS.IDLE,
  total: 0,
  blogDetails: null,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setBlogs: (state, { payload }) => {
      state.blogs = payload.result;
      state.total = payload.total;
    },
    setBlogDetails: (state, { payload }) => {
      state.blogDetails = payload;
    },
    setBlog: (state, { payload }) => {
      state.blogs = [payload, ...state.blogs];
      state.total += 1;
    },
    updateBlogSuccess: (state, { payload }) => {
      state.blogs = state.blogs.map((b) => (b._id === payload._id ? payload : b));
      if (state.blogDetails?._id === payload._id) {
        state.blogDetails = payload;
      }
    },
    resetBlogDetails: (state) => {
      state.blogDetails = null;
    },
    deleteBlogSuccess: (state, { payload }) => {
      state.blogs = state.blogs.filter((b) => b._id !== payload);
      state.total -= 1;
    }
  },
});

export const {
  setStatus,
  setBlogs,
  setBlogDetails,
  setBlog,
  updateBlogSuccess,
  resetBlogDetails,
  deleteBlogSuccess,
} = blogSlice.actions;

export default blogSlice.reducer;

// Thunks

export function addBlog(data: FormData, navigate?: any) {
  return async function addBlogThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    await service
      .addBlog(data)
      .then((res) => {
        dispatch(setBlog(res.data));
        dispatch(setStatus(STATUS.IDLE));
        navigate && navigate("/blogs");
        successHandler("Blog added successfully");
      })
      .catch((err) => {
        errorHandler(err.response || err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function getAllBlogs(keyword: string = "", limit: number = 10, offset: number = 0, status: string = "") {
  return async function getAllBlogsThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    await service
      .getAllBlogs(keyword, limit, offset, status)
      .then((res) => {
        dispatch(setBlogs(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((err) => {
        errorHandler(err.response || err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function getBlogById(id: string) {
  return async function getBlogByIdThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    await service
      .getBlogById(id)
      .then((res) => {
        dispatch(setBlogDetails(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((err) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err.response || err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function updateBlog(id: string, data: FormData, navigate?: any) {
  return async function updateBlogThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    await service
      .updateBlog(id, data)
      .then((res) => {
        dispatch(updateBlogSuccess(res.data));
        dispatch(setStatus(STATUS.IDLE));
        navigate && navigate("/blogs");
        successHandler("Blog updated successfully");
      })
      .catch((err) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err.response || err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function deleteBlog(id: string) {
  return async function deleteBlogThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    await service.deleteBlog(id).then(() => {
      dispatch(deleteBlogSuccess(id));
      dispatch(setStatus(STATUS.IDLE));
      successHandler("Blog deleted successfully");
    })
      .catch((err) => {
        errorHandler(err.response || err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }
}
