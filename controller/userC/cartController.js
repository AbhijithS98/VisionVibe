const cartModel= require('../../model/cartModel')
const userModel= require("../../model/userModel")
const productModel= require("../../model/productModel")
const walletModel = require('../../model/walletModel')
const couponModel = require('../../model/couponModel')


//loading cart page----------------------------------------------------
const loadCartPage =  async function(req,res){
 try{

  const userId = req.session.user._id
  let cart = await cartModel.findOne({userId:userId}).populate('items.product')
  if(cart){
    cart.items.sort((a, b) => b.cartDate - a.cartDate);
  }
  
  
    res.render('user/cart', { 
      user:req.session.user,
      cart:cart });
  }

 catch {

  console.error("Error loading cart page:", error);
  res.status(500).send("Internal Server Error");

 }
}



//adding item to cart-------------------------------------------------- 
const addToCart = async (req,res)=> {

try{



    const userId = req.session.user._id
  const {productId} = req.query;
  
  const product = await productModel.findById(productId)  
  let cart = await cartModel.findOne({userId: userId})
  
  const quantity = 1

  if(product.inStock === 0){
   return res.status(400).json({ message: 'Item out of Stock' });
  }

  if(!cart){
    const newCart = cartModel({

      userId: userId,
      items: [
      {  
        product: productId,
        price: product.regularPrice,
        quantity: quantity
      }
      ],
      totalPrice: product.regularPrice*quantity,
    
    })
    await newCart.save()
    res.status(200).json({ message: 'Product added to cart successfully' });
    
  }
  else {
    
      cart.items.push({
        product: productId,
        price: product.regularPrice,
        quantity: quantity,
      })

      cart.totalPrice = cart.items.reduce(
        (total,item)=> total + item.price * item.quantity,0
      )
      await cart.save();
      res.status(200).json({ message: 'Product added to cart successfully' });
    }
  

  
}

catch (error) {

  console.error("Error adding product to cart:", error);

  
  res.status(500).send("Internal Server Error");

}}



//QUANTITY UPDATE--------------------------------------
const quantityUpdate = async (req,res)=> {

  const {userId, productId, quantity} = req.body;

  const userCart = await cartModel.find({userId:userId})
 
  
if (userCart) {
   
    const cartItem = await userCart[0].items.find(item => item.product.toString() === productId);
   

  if (cartItem) {

      
      await cartModel.findOneAndUpdate(
        { userId: userId, 'items._id': cartItem._id },
        { $set: { 'items.$.quantity': quantity } }
    );

   
    const newSubtotal = (cartItem.price * quantity).toFixed(2);

    
    const updatedCart = await cartModel.findOne({ userId: userId });

 
    updatedCart.totalPrice = updatedCart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
    }, 0);

    
    // Save the updated cart
    await updatedCart.save();
    
    
    res.status(200).json({ 
        success: true,
        message: 'cart updated',
        totalPrice:updatedCart.totalPrice,
        subTotal: newSubtotal
      });

  } else {
      
      res.status(404).json({ success: false, message: 'Product not found' });
  }

}else {
  
  res.status(404).json({ success: false, message: 'Cart not found for user' });
}
}



//PRODUCT REMOVAL------------------------
const removeProduct = async (req,res)=>{
  try {
    const productid = req.query.id;

    const userId =req.session.user._id

    const result = await cartModel.updateOne(
        { userId: userId },
        { $pull: { items: { product: productid } }}
    );
    
      
      const updatedCart = await cartModel.findOne({ userId: userId });

  
      updatedCart.totalPrice = updatedCart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
      }, 0);
    
        
      // Save the updated cart
      await updatedCart.save();

      if (result.modifiedCount>0) {
        res.json({success:true})
      }else{
        res.json({success:false})
      }

} catch (error) {
  
  res.status(500).send("Internal Server Error");
}
}

//CHECK OUT PAGE------------------
const loadCheckout = async (req,res)=>{
  try{

    userId = req.session.user._id;
    const wallet = await walletModel.findOne({ userId }); 
    
   
    const cart = await cartModel.find({userId:userId}).populate('items.product')  
    const UserExist = await userModel.findById({_id:userId})
    const coupons = await couponModel.find({ userId: { $nin: [userId] } });
    const successMessage = req.flash('success');
  
    res.render("user/checkout",{ 
      user:req.session.user, 
      userData:UserExist, 
      cart:cart, 
      successMessage,
      wallet: wallet ,
      coupons:coupons 
    })
  }
  catch (error) {

    console.error("Error loading checkout page:", error);
    
    res.status(500).send("Internal Server Error");
  }
}



const validateCoupon = async (req, res) => {
  try {
      const { couponName } = req.body;
      
      const userId = req.session.user._id 


      const coupon = await couponModel.findOne({ coupon: couponName });
      if (!coupon) {
          return res.status(404).json({ message: 'Coupon not found' });
      }
      
      const userCart = await cartModel.findOne({ userId });

      const totalAmount = userCart.totalPrice;
      if (!userCart) {
          return res.status(404).json({ message: 'Cart not found' });
      }
      if (totalAmount<coupon.minimumAmount){
          return res.status(404).json({ message: `You have to spend minimum ${coupon.minimumAmount} rupees to apply this coupon`})
      }

      
      coupon.userId.push(userId);
      await coupon.save(); 

      const couponDeduction = Math.ceil(totalAmount*coupon.percentage/100)
      
     if(couponDeduction > coupon.maximumAmount ){

      const amountToPay = (totalAmount - coupon.maximumAmount)
      
      res.json({success: true,totalAmount:amountToPay,couponId:couponName,discountAmount:coupon.maximumAmount})   

     }else{

      const amountToPay = (totalAmount-couponDeduction)
      
      res.json({success: true,totalAmount:amountToPay,couponId:couponName,discountAmount:couponDeduction})
     }

  } catch (error) {
      console.error('Error applying coupon:', error);
      
      return res.status(500).json({ error: 'Internal server error' });
    }
}




module.exports = {
  loadCartPage,
  addToCart,
  quantityUpdate,
  removeProduct,
  loadCheckout,
  validateCoupon 
}