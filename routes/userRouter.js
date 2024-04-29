const express = require("express")
const isUser= require('../middleware/userAuth')
const router = express.Router()
const google = require('../helper/passportSetup')
const otpHelper = require("../helper/otpHelper")
const pwResetHelper = require("../helper/pwResetHelper")
const userController = require('../controller/userC/userController')
const cartController = require('../controller/userC/cartController')
const orderController = require('../controller/userC/orderController')


//SIGNUP AND LOGIN SIDE------------------------------------------
router.get ("/userregister",userController.loadregister)
router.post("/sendotp",otpHelper.sendOtp)
router.post("/verifyotp",otpHelper.verify)
router.post("/usersignup",userController.CreateUser)
router.get ("/userlogin",userController.loadlogin)



//Google sign in-------------------------------------------------
router.get('/auth/google',google.googleauth)
router.get('/google/callback',google.goog)



//FORGOT PASSWORD SIDE-------------------------------------------
router.get ("/forgotPassword",pwResetHelper.loadForgotPassword)
router.post('/PwResetRequest',pwResetHelper.sendResetMail)
router.get('/resetPwPage',pwResetHelper.loadResetPage)
router.post('/resetPassword',pwResetHelper.resetPassword)



//AUTHENTICATION SIDE--------------------------------------------
router.get ("/",userController.loadhome)
router.post("/userHome",userController.loadUserHome)
router.get ("/userlogout",userController.logoutUser)



//PRODUCT SIDE---------------------------------------------------
router.get("/productView/:id",userController.loadProductView)
router.get("/shoplist/:category?",userController.loadShoplist)
router.get("/categoryFilter/:category?",userController.loadShoplist)
router.get("/wishlist",isUser,userController.loadWishlist)
router.get("/addToWishlist",isUser,userController.addToWishlist)
router.delete("/removeWishList",isUser,userController.removeWishList)



//CART SIDE------------------------------------------------------
router.get("/cartpage",isUser,cartController.loadCartPage)
router.post("/addToCart",isUser,cartController.addToCart)
router.patch('/updateCartQuantity',isUser,cartController.quantityUpdate)
router.patch('/removeProductFromCart',isUser,cartController.removeProduct)



//CHECKOUT SIDE------------------------------------------------------
router.get("/checkout",isUser,cartController.loadCheckout)
router.post("/validateCoupon",isUser,cartController.validateCoupon)
router.post("/depositFromCheckout",isUser,userController.AddAmountToWallet)



//USER PROFILE---------------------------------------------------
router.get("/userprofile",isUser,userController.loadProfile)
router.post('/addAddress',isUser,userController.addAddress)
router.get("/editAddressPage",isUser,userController.loadEditAddress)
router.post('/editAddress',isUser,userController.editAddress)
router.delete('/deleteAddress',isUser,userController.deleteAddress)
router.post('/changePassword',isUser,userController.changePassword)



//ORDER SIDE-----------------------------------------------------
router.post('/placeOrder',isUser,orderController.placeOrder)
router.get("/orderInfo",isUser,orderController.loadOrderInfo)
router.post("/cancelOrder",isUser,orderController.cancelOrder)
router.post("/returnOrder",isUser,orderController.returnOrder)
router.post("/updateFailedPayment",isUser,orderController.updateFailedOrder)
router.get("/SuccessPage",isUser,orderController.loadOrderSuccess)



//WALLET SIDE------------------------------------------------------
router.get("/wallet",isUser,userController.loadWalletHistory)
router.post("/deposit",isUser,userController.depositAmount)



module.exports= router;


