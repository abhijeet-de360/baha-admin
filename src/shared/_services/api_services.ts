import axios from "axios";
import { authHeader } from "@/shared/_helper/auth-header";

export const rootUrl = "http://localhost:4000/api/v1";

const authUrl = rootUrl + "/admin";
const colorUrl = rootUrl + "/color";
const faqUrl = rootUrl + "/faq";
const sizeUrl = rootUrl + "/size";
const settingsUrl = rootUrl + "/settings";
const couponUrl = rootUrl + "/coupon";
const categoryUrl = rootUrl + "/category";
const subCategoryUrl = rootUrl + "/subCategory";
const sizeChartUrl = rootUrl + "/sizeChart";
const productUrl = rootUrl + "/product";
const bannerUrl = rootUrl + "/heroBanner";
const testimonialUrl = rootUrl + "/testimonial";
const blogUrl = rootUrl + "/blog";

//***************** Authentication api service functions ******************* */
// Admin login api service function
async function loginUser(data: object) {
  return await axios.post(authUrl + "/login", data);
}

// Admin me api service function
async function getProfile() {
  return await axios.get(authUrl + "/profile", {
    headers: await authHeader(),
  });
}

// Admin update profile
async function updateProfile(data: object) {
  return await axios.patch(`${authUrl}/update`, data, {
    headers: await authHeader(),
  });
}

// Reset Password api service function
async function resetPassword(data: object) {
  return await axios.patch(`${authUrl}/reset-password`, data, {
    headers: await authHeader(),
  });
}

//***************** Colors api service functions ******************* */
// Add color api service function
async function addColor(data: object) {
  return await axios.post(colorUrl + "/create", data, {
    headers: await authHeader(),
  });
}

// Get all colors api service function
async function getAllColors(
  keyword: string,
  limit: number,
  offset: number,
  status: string,
) {
  return await axios.get(
    colorUrl +
      `/list?keyword=${keyword}&limit=${limit}&offset=${offset}&status=${status}`,
    {
      headers: await authHeader(),
    },
  );
}

// Update color api service function
async function updateColor(id: string, data: object) {
  return await axios.patch(`${colorUrl}/update/${id}`, data, {
    headers: await authHeader(),
  });
}

// Delete color api service function
async function deleteColor(id: string) {
  return await axios.delete(`${colorUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/********************* FAQ api service functions ************************* */
// Add faq api service function
async function addFaq(data: object) {
  return await axios.post(faqUrl + "/create", data, {
    headers: await authHeader(),
  });
}

// Get all faqs api service function
async function getAllFaqs() {
  return await axios.get(faqUrl + "/list", {
    headers: await authHeader(),
  });
}

// Update faq api service function
async function updateFaq(id: string, data: object) {
  return await axios.patch(`${faqUrl}/update/${id}`, data, {
    headers: await authHeader(),
  });
}

// Delete faq api service function
async function deleteFaq(id: string) {
  return await axios.delete(`${faqUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/********************** Size api service function ********************* */
// Get all sizes service function
async function getAllSizes(
  keyword: string,
  limit: number,
  offset: number,
  status: string,
) {
  return await axios.get(
    sizeUrl +
      `/list?keyword=${keyword}&limit=${limit}&offset=${offset}&status=${status}`,
  );
}

// Add size service function
async function addSize(data: object) {
  return await axios.post(sizeUrl + "/create", data, {
    headers: await authHeader(),
  });
}

// Update size service function
async function updateSize(id: string, data: object) {
  return await axios.patch(`${sizeUrl}/update/${id}`, data, {
    headers: await authHeader(),
  });
}

// Delete size service function
async function deleteSize(id: string) {
  return await axios.delete(`${sizeUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/********************** Settings api service function ********************* */
// Get all settings service function
async function getAllSettings() {
  return await axios.get(settingsUrl + "/all");
}

// Add or update settings service function
async function updateSettings(data: object) {
  return await axios.patch(settingsUrl + "/add", data, {
    headers: await authHeader(),
  });
}

/********************** Coupon api service function ********************* */
// Get all coupons service function
async function getAllCoupons(
  keyword: string,
  limit: number,
  offset: number,
  status: string,
) {
  return await axios.get(
    couponUrl +
      `/list?keyword=${keyword}&limit=${limit}&offset=${offset}&status=${status}`,
  );
}

// Add coupon service function
async function addCoupon(data: object) {
  return await axios.post(couponUrl + "/create", data, {
    headers: await authHeader(),
  });
}

// Update coupon service function
async function updateCoupon(id: string, data: object) {
  return await axios.patch(`${couponUrl}/update/${id}`, data, {
    headers: await authHeader(),
  });
}

// Delete coupon service function
async function deleteCoupon(id: string) {
  return await axios.delete(`${couponUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/********************* Category api services function ************************ */
async function getAllCategories(
  keyword: string,
  limit: number,
  offset: number,
  status: string,
) {
  return await axios.get(
    categoryUrl +
      `/list?keyword=${keyword}&limit=${limit}&offset=${offset}&status=${status}`,
  );
}

async function addCategory(data: object) {
  return await axios.post(categoryUrl + "/create", data, {
    headers: await authHeader("FormData"),
  });
}

async function updateCategory(id: string, data: object) {
  return await axios.patch(`${categoryUrl}/update/${id}`, data, {
    headers: await authHeader("FormData"),
  });
}

async function deleteCategory(id: string) {
  return await axios.delete(`${categoryUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/************************* Sub Category service functions *************************** */

async function getAllSubCategories(
  keyword?: string,
  limit?: number,
  offset?: number,
  status?: string,
  categoryId?: string,
) {
  return await axios.get(
    subCategoryUrl +
      `/list?keyword=${keyword}&limit=${limit}&offset=${offset}&status=${status}&categoryId=${categoryId}`,
  );
}

async function addSubCategory(data: object) {
  return await axios.post(subCategoryUrl + "/create", data, {
    headers: await authHeader(),
  });
}

async function updateSubCategory(id: string, data: object) {
  return await axios.patch(`${subCategoryUrl}/update/${id}`, data, {
    headers: await authHeader(),
  });
}

async function deleteSubCategory(id: string) {
  return await axios.delete(`${subCategoryUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/************************* Size Chart api services function *************************** */
async function getAllSizeCharts(
  keyword: string,
  limit: number,
  offset: number,
) {
  return await axios.get(
    sizeChartUrl + `/list?keyword=${keyword}&limit=${limit}&offset=${offset}`,
  );
}

async function addSizeChart(data: object) {
  return await axios.post(sizeChartUrl + "/create", data, {
    headers: await authHeader(),
  });
}

async function updateSizeChart(id: string, data: object) {
  return await axios.patch(`${sizeChartUrl}/update/${id}`, data, {
    headers: await authHeader(),
  });
}

async function deleteSizeChart(id: string) {
  return await axios.delete(`${sizeChartUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/************************* Product service function *************************** */

async function addProduct(data: object) {
  return await axios.post(productUrl + "/create", data, {
    headers: await authHeader("FormData"),
  });
}

async function updateProduct(id: string, data: object) {
  return await axios.patch(`${productUrl}/update/${id}`, data, {
    headers: await authHeader("FormData"),
  });
}

async function getAllProducts(
  keyword?: string,
  limit?: number,
  offset?: number,
  status?: string,
  category?: string,
  size?: string,
) {
  return await axios.get(
    `${productUrl}/list?keyword=${keyword}&limit=${limit}&offset=${offset}&status=${status}&category=${category}&size=${size}`,
  );
}

async function getProductById(id: string) {
  return await axios.get(`${productUrl}/${id}`, {
    headers: await authHeader(),
  });
}

async function deleteProduct(id: string) {
  return await axios.delete(`${productUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/************************* Banner service function *************************** */
async function addBanner(data: FormData) {
  return await axios.post(bannerUrl + "/create", data, {
    headers: await authHeader("FormData"),
  });
}

async function updateBanner(id: string, data: FormData) {
  return await axios.patch(`${bannerUrl}/update/${id}`, data, {
    headers: await authHeader("FormData"),
  });
}

async function getAllBanners(
  keyword?: string,
  status?: string,
) {
  return await axios.get(
    `${bannerUrl}/list?keyword=${keyword}&status=${status}`,
  );
}

async function getBannerById(id: string) {
  return await axios.get(`${bannerUrl}/${id}`, {
    headers: await authHeader(),
  });
}

async function deleteBanner(id: string) {
  return await axios.delete(`${bannerUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/*************************** Testimonial service function *************************** */
async function addTestimonial(data: FormData) {
  return await axios.post(testimonialUrl + "/create", data, {
    headers: await authHeader("FormData"),
  });
}

async function updateTestimonial(id: string, data: FormData) {
  return await axios.patch(`${testimonialUrl}/update/${id}`, data, {
    headers: await authHeader("FormData"),
  });
}

async function getAllTestimonials() {
  return await axios.get(`${testimonialUrl}/list`);
}

async function deleteTestimonial(id: string) {
  return await axios.delete(`${testimonialUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

/*************************** Blog service function *************************** */
async function addBlog(data: FormData) {
  return await axios.post(blogUrl + "/create", data, {
    headers: await authHeader("FormData"),
  });
}

async function updateBlog(id: string, data: FormData) {
  return await axios.patch(`${blogUrl}/update/${id}`, data, {
    headers: await authHeader("FormData"),
  });
}

async function getAllBlogs(keyword, limit, offset, status) {
  return await axios.get(
    `${blogUrl}/list?keyword=${keyword}&limit=${limit}&offset=${offset}&status=${status}`,
  );
}

async function deleteBlog(id: string) {
  return await axios.delete(`${blogUrl}/delete/${id}`, {
    headers: await authHeader(),
  });
}

async function getBlogById(id: string) {
  return await axios.get(`${blogUrl}/${id}`, {
    headers: await authHeader(),
  });
}

export const service = {
  loginUser,
  getProfile,
  updateProfile,
  resetPassword,
  addColor,
  getAllColors,
  updateColor,
  deleteColor,
  addFaq,
  getAllFaqs,
  updateFaq,
  deleteFaq,
  getAllSizes,
  addSize,
  updateSize,
  deleteSize,
  getAllSettings,
  updateSettings,
  getAllCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllSubCategories,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getAllSizeCharts,
  addSizeChart,
  updateSizeChart,
  deleteSizeChart,
  addProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  addBanner,
  getAllBanners,
  updateBanner,
  getBannerById,
  deleteBanner,
  addTestimonial,
  getAllTestimonials,
  updateTestimonial,
  deleteTestimonial,
  addBlog,
  updateBlog,
  getAllBlogs,
  deleteBlog,
  getBlogById
};
