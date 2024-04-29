const orderModel= require("../../model/orderModel")
const userModel= require("../../model/userModel")
const couponModel= require("../../model/couponModel")


const loadOrderList = async (req,res) => {

  try{

    const orders = await orderModel.find({}).populate("userID").sort({orderDate:-1})
    

    res.render("admin/orderList",{
      orders:orders
    })

  } catch (error) {

    console.error("Error loading order list:", error.message);
    res.status(500).send("Internal Server Error");

  }
  
}


const loadOrderDetail = async (req,res) => {

  try{

    const {orderID,userID} = req.query;
    
    const order = await orderModel.find({ _id: orderID }).populate('items.product');
    const user =  await userModel.find({ _id: userID })
   

    res.render("admin/orderDetail",{
      order:order,
      user:user
    })

  } catch (error) {

    console.error("Error loading order list:", error.message);
    res.status(500).send("Internal Server Error");

  }
  
} 




const updateStatus = async (req, res) => {
  const { orderId, itemId, status } = req.body;

  try {
      // Update status in the database
      const updatedOrder = await orderModel.findOneAndUpdate(
          { _id: orderId, 'items._id': itemId },
          { $set: { 'items.$.status': status } },
          { new: true }
      );

      if (!updatedOrder) {
          return res.status(404).json({ message: 'Order or item not found' });
      }

      // Respond with updated order
      res.json(updatedOrder);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update status' });
  }
};

const loadCouponList = async (req,res) => {

  try{

    const coupons = await couponModel.find({})
    const {sucsMsg} = req.flash();

    res.render("admin/couponlist",{
      coupons:coupons,
      sucsMsg:sucsMsg,
      admin:req.session.admin
    })

  } catch (error) {

    console.error("Error loading coupon list:", error.message);
    res.status(500).send("Internal Server Error");

  }
  
}



const loadCouponAdd = async (req,res) => {

  try{
   
    const {errMsg} = req.flash();
    const currentDate = new Date().toISOString().slice(0, 10);
    res.render("admin/couponAdd",{
      admin:req.session.admin,
      errMsg:errMsg,
      currentDate: currentDate
    })

  } catch (error) {

    console.error("Error loading coupon list:", error.message);
    res.status(500).send("Internal Server Error");

  }
  
}



const addCoupon = async(req,res)=>{
  try
  {    

    const {couponName,description,percentage,maximumAmount,expiryDate,minimumAmount} = req.body;

    const existingCoupon = await couponModel.findOne({coupon:couponName})

    if(!existingCoupon){

    // Create a new coupon
    const newCoupon = new couponModel({
      coupon: couponName,
      description: description,
      percentage: percentage,
      maximumAmount: maximumAmount,
      minimumAmount:minimumAmount,
      expiryDate: expiryDate
    });

    // Save the new coupon to the database
    await newCoupon.save();

    req.flash('sucsMsg','Coupon Created Successfully')                  
    return  res.redirect("/couponlist")
       
    }else{
        req.flash('errMsg','Coupon Already Exists')
        res.redirect("/couponAdd") 
      } 

  } catch (error) {
    
    console.error("Error fetching category data:", error);
    res.status(500).send("Internal Server Error");
  }
};



const listOrUnlistCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const coupon = await couponModel.findOne({ _id: id });

    if (!id || !coupon) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid coupon ID" });
    }

    if (coupon.isListed === true) {
      await couponModel.updateOne({ _id: id }, { $set: { isListed: false } });
      return res.json({ success: true, flag: 1 });
    } else {
      await couponModel.updateOne({ _id: id }, { $set: { isListed: true } });
      return res.json({ success: true, flag: 0 });
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};




module.exports= {
  loadOrderList,
  loadOrderDetail,
  updateStatus,
  loadCouponList,
  loadCouponAdd,
  addCoupon,
  listOrUnlistCoupon

}