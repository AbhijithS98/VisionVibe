const productModel= require("../../model/productModel")
const cartModel= require('../../model/cartModel')
const userModel= require("../../model/userModel")
const orderModel= require("../../model/orderModel")
const walletModel = require('../../model/walletModel')



const placeOrder = async (req, res) => {

  try {


      const userId = req.session.user._id;
      const{addressIndex,payment_option,cartTotal,discount,RazPayFail} = req.body;

      const user = await userModel.findOne({ _id: userId });
      const cart = await cartModel.findOne({ userId: userId });

      if(user){

        const address = user.address[addressIndex];

        
            const billingDetails = {
                                    name: address.name,
                                    mobile: address.mobile,
                                    pincode: address.pincode,
                                    houseName: address.houseName,
                                    cityOrTown: address.cityOrTown,
                                    district: address.district,
                                    state: address.state,
                                    country: address.country,         
                                  };

      
        const paymentStatus = (payment_option === 'Razorpay' && !RazPayFail) ? 'Paid' : (payment_option === 'Wallet') ? 'Paid' :   'Pending';
                            

        const order = new orderModel({
                                      userID: userId,
                                      items: cart.items,
                                      totalPrice: cartTotal,
                                      billingDetails: billingDetails,
                                      paymentMethod: payment_option,
                                      paymentStatus: paymentStatus,
                                      discount: discount,
                                      orderDate: Date.now() 
                                    });


        // Save the order to the database
        await order.save();

  
        for (const item of cart.items) {
                                        const product = await productModel.findById(item.product);
                                        if (product) {
                                            product.inStock -= item.quantity;
                                            await product.save();
                                        }
                                      }

    
        await cartModel.findOneAndUpdate(
          { userId:userId },
          { $set: {items: [], totalPrice: 0 } }
        );

        if(payment_option === 'Wallet'){
          await walletModel.findOneAndUpdate(
            { userId:userId},
            { $inc: { balance: -order.totalPrice },
              $push: { 
                      transactions: {
                                    orderId: order._id,
                                    amount: (-order.totalPrice).toFixed(2),
                                    status: 'success',
                                    type: 'debit',
                                    date: new Date()
                                    }
                    } 
            }
          ); 
        }

          const newOrder =  await orderModel.findById(order._id).populate('items.product').exec()
          
          res.render("user/orderplaced",{ title: 'Thank You!',user:req.session.user,order:newOrder })
          

      }else { 
      
      
      res.status(404).json({ message: 'User not found' });
    }
     
      
  } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Failed to place order' });
  }
};


//LOADING ORDER INFO PAGE-----------------------------------------------------

const loadOrderInfo =async (req,res)=>{

  try{

    const {id} = req.query;
    

    const order = await orderModel.find({ _id: id }).populate('items.product');
    

    res.render("user/orderInfo",{
    user:req.session.user,
    order:order,
    })

  }catch (error) {

    console.error('Error loading OrderInfo:', error);
    res.status(500).json({ message: 'Failed to load OrderInfo' });

  }
  
}



const cancelOrder = async (req,res)=> {

try {

const userId = req.session.user._id;
const { orderId, itemId, Reasons} = req.body;
const { admin } = req.query;



  
    
    const order = await orderModel.findOne({ _id: orderId, userID: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

   
    const item = order.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in order' });
    }

    
    item.status = 'Cancelled';
    item.cancelReason.push(...Reasons);

  
    const product = await productModel.findById(item.product);
    if (product) {
      product.inStock += item.quantity;
      await product.save();
    }

    // Save the changes to the order
    if(admin){
      item.hasMessage = true;
    }
    
    const wallet = await walletModel.findOne({ userId: userId });
    if (!wallet) {
      // If wallet doesn't exist, create a new one
      const newWallet = new walletModel({
        userId: userId,
        balance: 0,
        transactions: []
      });
      await newWallet.save();
    }

    const updatedWallet = await walletModel.findOne({ userId: userId });

    if(updatedWallet && order.paymentMethod !== 'COD' ){
      
      let itemSubtotal = item.price*item.quantity
      

      updatedWallet.balance += itemSubtotal 
    
      updatedWallet.transactions.push({
        orderId: order._id,
        amount: itemSubtotal,
        status: "refunded",
        type: "credit",
        date: new Date()
      });
   
      await updatedWallet.save()
    }

    await order.save();

   
    
    res.status(200).json({ message: 'Order cancelled successfully' });
    
   

} catch (error) {

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });

}

}




const returnOrder = async (req,res)=> {

  try {
  
    const userId = req.session.user._id;
    const { orderId,itemId,reasons } = req.body;
    const { admin } = req.query;
       
      const order = await orderModel.findOne({ _id: orderId, userID: userId });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
     
      const item = order.items.find((item) => item._id.toString() === itemId);
  
      if (!item) {
        return res.status(404).json({ message: 'Item not found in order' });
      }
  
      
      item.status = 'Returned';
      item.returnReason.push(...reasons);
  
    
      const product = await productModel.findById(item.product);
      if (product) {
        product.inStock += item.quantity;
        await product.save();
      }
  
      
      
      const wallet = await walletModel.findOne({ userId: userId });
      
  
      if(wallet && order.paymentMethod !== 'COD' ){
       
        let itemSubtotal = item.price*item.quantity
       
  
        wallet.balance += itemSubtotal 
      
        wallet.transactions.push({
          orderId: order._id,
          amount: itemSubtotal,
          status: "refunded",
          type: "credit",
          date: new Date()
        });
     
        await wallet.save()
      }
  
      await order.save();
  
     
      
      res.status(200).json({ message: 'Order returned successfully' });
      
     
  
  } catch (error) {
  
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  
  }
  
}


const updateFailedOrder = async (req,res)=>{

  const {orderId}  = req.query;
  
 
 try{

  const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "Paid" });
  

  res.status(200).json({ message: 'Order updated successfully', orderid: updatedOrder._id });
  
 }catch (error) {

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
 }

}



const loadOrderSuccess = async(req,res)=>{
  try{
    const {orderId} = req.query;
    

    const Order =  await orderModel.findById(orderId).populate('items.product').exec()
    

    res.render("user/orderplaced",{ title: 'Thank You!',user:req.session.user,order:Order })
  } catch (error){

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
  }
}





module.exports= {
  placeOrder,
  loadOrderInfo,
  cancelOrder,
  returnOrder,
  updateFailedOrder,
  loadOrderSuccess
}


