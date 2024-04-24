const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getSingleProduct,
  getAllProduct,
  getSingleProductAll,
  getProductByCategory,
  deleteAllProducts,
  getProductsById,
  sendNotificationEmail,
  generateAndDownloadReport
} = require("../Controllers/productController");
const { upload } = require("../Utills/fileupload");
const { authenticate} = require('../middleware/authMiddleware');


router.post("/",upload.single("image"), createProduct);
router.patch("/:id", upload.single("image"), updateProduct);
router.delete("/:id",deleteProduct);
router.get("/all",getAllProduct);
router.get("/",  getProduct);
router.get("/:id",  getSingleProductAll);
router.get("/:id", getSingleProduct);
router.get('/category/:category',getProductByCategory);
router.delete('/products/deleteall', deleteAllProducts);
router.get('/user-products/:id',getProductsById);
router.post('/send-notification-email', sendNotificationEmail);
router.get('/report/generate', generateAndDownloadReport);

module.exports = router;
