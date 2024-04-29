const express=require('express')
const router=express.Router()
const nocache=require('nocache')
const upload=require('../middleware/multer')
const isAdmin= require('../middleware/adminAuth')
const adminController=require('../controller/adminC/adminController')
const categoryController=require('../controller/adminC/categoryController')
const productController=require('../controller/adminC/productController')
const customerController=require('../controller/adminC/customerController')
const orderController=require('../controller/adminC/ordersController')




//ADMIN SIDE-------------------------------------------------------------------
router.get ('/adminlogin',adminController.loadlogin)
router.post('/admindashboard',adminController.loaddashboard)
router.get ('/admindashboard',isAdmin,adminController.backtodashboard)
router.get ("/logout",isAdmin,adminController.logoutadmin)



//CATEGORY SIDE-----------------------------------------------------------------
router.get  ('/categorylist',isAdmin,categoryController.loadcategorylist)
router.get  ('/editCategory',isAdmin,categoryController.loadeditCategory)
router.post ("/updateCategory/:id",isAdmin,categoryController.updateCategory)
router.post ('/addtocategory',isAdmin,categoryController.addCategory)
router.patch("/unlist",isAdmin,categoryController.unlistorlist)



//PRODUCT SIDE------------------------------------------------------------------
router.get   ('/productlist',isAdmin,productController.loadproductlist)
router.get   ('/productadd',isAdmin,productController.loadproductadd)
router.get   ('/productedit',isAdmin,productController.loadproductedit)
router.post  ('/editProduct/:id',upload.array("images",5),productController.updateproducts)
router.post  ('/addproducts',upload.array("images",5),productController.addproducts)
router.patch ('/listOrUnlistProduct',isAdmin,productController.listOrUnlistProduct)
router.delete('/deleteImage/:productId/:index',isAdmin,productController.deleteImage)
router.patch ('/applyProductOffer',isAdmin,productController.applyProductOffer)



//CUSTOMER MANAGEMENT---------------------------------------------------------------
router.get('/customerlist',isAdmin,customerController.loadcustomerlist)
router.patch('/blockOrUnblockUser',isAdmin,customerController.blockOrUnblockUser)



//ORDER MANAGEMENT-----------------------------------------------------------------
router.get('/orderlist',isAdmin,orderController.loadOrderList)
router.get('/orderDetail',isAdmin,orderController.loadOrderDetail)
router.post('/updateStatus',isAdmin,orderController.updateStatus)



//COUPON SIDE----------------------------------------------------------------
router.get('/couponlist',isAdmin,orderController.loadCouponList)
router.get('/couponAdd',isAdmin,orderController.loadCouponAdd)
router.post('/addCoupon',isAdmin,orderController.addCoupon)
router.patch ('/listOrUnlistCoupon',isAdmin,orderController.listOrUnlistCoupon)



//SALES REPORT & SALES CHART SIDE ---------------------------------------------------
router.get('/generateReport',adminController.generateReport)
router.get ("/bestSellings",isAdmin,adminController.loadBestSellings)
router.post('/showcart',isAdmin,adminController.showChart)




module.exports= router;