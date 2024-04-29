const userHelper = require("../../helper/userHelper")
const productModel= require("../../model/productModel")
const cartModel= require('../../model/cartModel')
const userModel= require("../../model/userModel")
const orderModel= require("../../model/orderModel")
const categoryModel= require("../../model/categoryModel")
const wishlistModel = require('../../model/wishlistModel');
const walletModel = require('../../model/walletModel')
const bcrypt = require("bcrypt")


//-------------------------------------------RENDERING LOGIN PAGE--------------------------------------------------

const loadlogin = function (req,res){  
 
  const { successMessage, errorMessage } = req.session;

  // Clear the session
  req.session.successMessage = null;
  req.session.errorMessage = null;
  
  res.render("user/user-login",{error: req.flash('error'),successMessage,errorMessage});
}





//-----------------CHANGING PASSWORD--------------------------------------
const changePassword = async (req, res) => {


  const {currentPassword, newPassword, confirmPassword, email} = req.body;
  const trimmedEmail = email.trim();
 
  const user = await userModel.findOne({email:trimmedEmail})
  

  if (user) {
      
      bcrypt.compare(currentPassword, user.password, async (err, result) => {
          if (err) {

              console.error(err);
              res.status(500).send('Failed to compare passwords');
              return;
          }

          if (result) {
              try {

                  if (newPassword !== confirmPassword) {
                  return res.status(400).send('Passwords do not match');
                  }
                  
                  // Hash the new password
                  const newPass = await bcrypt.hash(newPassword, 10);

                  // Update the user's password in the database
                  
                   await userModel.findOneAndUpdate(
                    { email: email },
                    { password: newPass },
                    { new: true}
                   );

                  res.status(200).send('Password updated successfully');
                  

              } catch (err) {
                  console.error(err);
                  res.status(500).send('Failed to update password');
              }
          } else {
              res.status(400).send('Current password is incorrect');
          }
      });

  }else {
    
    res.status(500).send('Failed to find user');
  }
  
}


//------------------------------------------RENDERING USER REGISTER PAGE-------------------------------------------

const loadregister = function (req,res){
  const {message} = req.query;
  res.render("user/user-register",{message})
}


//-------------------------------------------RENDERING HOME PAGE----------------------------------------------------


const loadhome= async function(req,res){
  try{
    let proData;

    if (req.query.SP) {

      const regex = new RegExp(req.query.SP, 'i'); 
            proData = await productModel.find({ productName: { $regex: regex } }).populate('category');
       

    } else {

      
      proData = await productModel.find({}).populate("category");
    }

    res.render("user/user-home",{data:proData, user:req.session.user})

  }
  catch (error){
    console.error("Error fetching product data:", error);
   
    res.status(500).send("Internal Server Error");
  }
}


//---------------------------------------------------LOADING USERHOME-------------------------------------------------------

const loadUserHome= async (req,res)=> {
  try {
    const bodyEmail= req.body.email
    const userExist= await userModel.findOne({email:bodyEmail})
    const bodyPass= req.body.password

    if(!userExist){
      req.flash('error', 'No user found with the eamil');
      res.redirect('/userlogin')
    } 
    else if(bcrypt.compareSync(bodyPass,userExist.password)){
      if(userExist.isActive===true)
      {
      req.session.user= userExist
      res.redirect('/')}
      else{
        req.flash('error', 'Your Account is blocked');
        res.redirect('/userlogin')
      }
    }
    else{
      req.flash('error', 'Password is Incorrect');
      res.redirect('/userlogin')
    }
  } 
  catch (error) {
      res.status(500).send("Internal Server Error");
  }

}

//-----------------------------------------------LOADING USER PROFILE------------------------------------------------------

const loadProfile = async function (req,res){

  try {

    const userId = req.session.user._id;
    const orders = await orderModel.find({ userID: userId }).sort({orderDate:-1})
    

    const {message} = req.session;
    delete req.session.message; 
  
    res.render("user/profile",{
      user:req.session.user, 
      message:message,
      orders: orders,
    })

  } catch (error) {

    res.status(500).send("Internal Server Error");
  }

}


//-----------------------------------------------ADDING NEW ADDRESS---------------------------------------------------

const addAddress = async (req,res)=> {
  try {

    const userId = req.session.user._id
    
    const newAddress = req.body;

    const {flag} = req.query

    const User = await userModel.findById(userId)
    

    if(User){

      User.address.push(newAddress)

      await User.save();

      if(!flag){
        req.session.message = 'Address added successfully';
        req.session.user = User;
        res.redirect("/userprofile")
      }else{
        req.flash('success', 'Address added successfully');
        res.redirect("/checkout")
      }
      
      
    } else {
      return res.status(404).json({ message: 'User not found' });
    }

  } catch (error) {

    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });

  }
}

//---------------------------------------LOADING EDIT ADDRESS PAGE---------------------------------------------

const loadEditAddress = async function (req,res){
  
  const {flag} = req.query;
  const addressId = req.query.id;
  const userId = req.session.user._id;

  try {

    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    else {

    const address = user.address.id(addressId);
    

    if (!address) {

        return res.status(404).json({ message: 'Address not found' });
    }else{
      if(flag){
        res.render("user/cpAddressEdit", { user: req.session.user, address: address });
      }else {
        res.render("user/addressEdit", { user: req.session.user, address: address });
      }
      
    }
  
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


//----------------------------------------------EDITING ADDRESS----------------------------------------------------

const editAddress = async (req, res) => {

  try {
    const {flag} = req.query;
    const addressId = req.query.id;
    const userId = req.session.user._id;
    const newData = req.body;
    
    const updatedUser = await userModel.findOneAndUpdate(
      { 
        _id: userId, 
        "address._id": addressId 
      },
      { 
        $set: {
          "address.$[elem].name": newData.name,
          "address.$[elem].mobile": newData.mobile,
          "address.$[elem].pincode": newData.pincode,
          "address.$[elem].houseName": newData.houseName,
          "address.$[elem].cityOrTown": newData.cityOrTown,
          "address.$[elem].district": newData.district,
          "address.$[elem].state": newData.state,
          "address.$[elem].country": newData.country
        } 
      },
      { 
        new: true,
        arrayFilters: [{ "elem._id": addressId }]
      }
    );

  
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }
  else {
    
    if(!flag){
      req.session.user = updatedUser;
      req.session.message = 'Address edited successfully';
      res.redirect("/userprofile");
    }else{

      res.redirect("/checkout");
    }
    
  }
  
  } catch (error) {

    
    return res.status(500).json({ message: 'Internal server error' });
  }
};


//--------------------------------------DELETING ADDRESS------------------------------------------------

const deleteAddress = async (req,res)=>{
  
  const { addressId } = req.query;
  const userId = req.session.user._id;

  try {
  
  const updatedUser = await userModel.findOneAndUpdate(
    { 
        _id: userId 
    },
    { 
        $pull: {
            address: { _id: addressId }
        } 
    },
    { 
        new: true
    }
);

  if (!updatedUser) {
      return res.status(404).send('Address not found');
  }

  res.status(200).send('Address deleted successfully');

} catch (err) {

   
    console.error(err);
    res.status(500).send('Failed to delete address');
}

}






//---------------------------------------LOGGING OUT USER--------------------------------------------------

const logoutUser =(req,res)=>{
  try{
      req.session.user = null
      res.redirect('/userlogin')

  }catch(error){

    res.status(500).send("Internal Server Error");
  }
}


//-------------------------------------CREATING NEW USER---------------------------------------------------------

const CreateUser = async (req, res) => {
  try {
    
    
    const response = await userHelper.doSignUp(
      req.body,
      req.session.otpmatched,
      req.session.userEmail
    );
    if (!response.status) {
                
      res.redirect(`/userregister?message=${encodeURIComponent(response.message)}`);
    } else {
      
      res.redirect("/userlogin");
    }
  } catch (err) {

    res.status(500).send("Internal Server Error");
  }
};



//----------------------------LOADING SHOPLIST PAGE----------------------------------------
const loadShoplist = async function(req, res) {
  try {

    const categoryId = req.params.category || undefined;
    const page = parseInt(req.query.page) || 1; 
    const limit = 4; // Number of products per page
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy;
   

    const categories = await categoryModel.find({});
    let productsQuery = productModel.find({});
    let categoryFilter = {};

    

    if (sortBy === 'Price: Low to High') {
      productsQuery = productsQuery.sort({ regularPrice: 1 });
    } else if (sortBy === 'Price: High to Low') {
      productsQuery = productsQuery.sort({ regularPrice: -1 });
    } else if (sortBy === 'aA - zZ') {
      productsQuery = productsQuery.sort({ productName: 1 });
    } else if (sortBy === 'zZ - aA') {
      productsQuery = productsQuery.sort({ productName: -1 });
    } else if (sortBy === 'New Arrivals') {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      productsQuery = productsQuery.find({ createdOn: { $gte: tenDaysAgo.getTime() } });
    }


      // Apply category filter if provided
      if (categoryId) {
        categoryFilter = { 'category': categoryId };
      }
   

      if (req.query.SP) {
      const regex = new RegExp(req.query.SP, 'i');
      productsQuery = productsQuery.find({ productName: { $regex: regex } });
      } 

      productsQuery = productsQuery.find(categoryFilter);

    const totalItems = await productModel.countDocuments(categoryFilter);
    const totalPages = Math.ceil(totalItems / limit);

    let products = await productsQuery.skip(skip).limit(limit).populate("category");

    

    res.render("user/user-shoplist", { 
      data: products,
      sortBy: sortBy,
      currentPage: page, 
      totalPages: totalPages,
      user: req.session.user,
      categories,
      text: categoryId 
    });

  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).send("Internal Server Error");
  }
}




//-------------------------------LOADING PRODUCT VIEW PAGE---------------------------------------------------

const loadProductView= async (req,res)=> {
  try {
    const proID= req.params.id
    const Product= await productModel.findOne({_id:proID}).populate("category")
    const relProds= await productModel.find({category:Product.category})
    
    if(req.session.user){
      const userId = req.session.user._id
      const productInCart = await cartModel.findOne({
        userId: userId,
        'items.product': proID
      })
    
    
      res.render("user/user-productView",{
        data:Product ,
        user:req.session.user, 
        relData:relProds, 
        productInCart:productInCart })
    }

    else {
      res.render("user/user-productView",{
        data:Product ,
        user:req.session.user, 
        relData:relProds })
    }

  } catch (error) {

    console.error("Error fetching product data:", error);
  
    res.status(500).send("Internal Server Error");
  }
}



//-------------------------LOADING WISHLIST PAGE------------------------------------
const loadWishlist = async (req,res)=> {

  let productIds = [];
  const userId = req.session.user._id;
  const userCart = await cartModel.findOne({ userId: userId})
  if(userCart){
     productIds = userCart.items.map(item => item.product.toString());
  }
 

  try{

    let wishlist = await wishlistModel.findOne({ userId }).populate('items.product')
    if(wishlist){
      wishlist.items.sort((a, b) => b.wishDate - a.wishDate);
    }
    

    res.render("user/wishlist",{
      user:req.session.user,
      wishlist:wishlist,
      cartItemIds:productIds
    })

  } catch (error) {

    console.error("Error loading wishlist:", error); 
    res.status(500).send("Internal Server Error");
  }
  
}



//-----------------------ADD ITEM TO WISHLIST----------------------------------------
const addToWishlist = async (req,res)=> {

  const {productId} = req.query;
  const  userId     = req.session.user._id;

  try {
    let wishlist = await wishlistModel.findOne({ userId });

    if (!wishlist) {
      wishlist = new wishlistModel({ userId, items: [] });
    }

    if (wishlist.items.some(item => item.product.toString() === productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push({ product: productId });

    await wishlist.save();

    return res.status(200).json({ message: 'Product added to wishlist successfully' });

  } catch (err) {

    console.error('Error adding product to wishlist:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



//------------------------REMOVING ITEM FROM WISHLIST--------------------------
const removeWishList = async (req,res) => {

  const {itemId} = req.query;
  const userId = req.session.user._id;
  

   try {
      
        let wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        
        // Remove the item from the items array
        wishlist.items =  wishlist.items.filter(item => item._id.toString() !== itemId);

        

        // Save the updated wishlist document
        await wishlist.save();

        res.status(200).json({ message: 'Item removed from wishlist'});

    } catch (error) {

        console.error('Error removing item from wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



//----------------------LOADING WALLET PAGE----------------------------------------------
const loadWalletHistory =  async (req,res)=>{

  const userId = req.session.user._id; 
  
  try {
    const wallet = await walletModel.findOne({ userId });
    const successMessage = req.flash('success');

    res.render("user/wallet",{
      user:req.session.user,
      successMessage: successMessage,
      wallet:wallet
    })

  } catch(error) {

    console.error('Error loading wallet page:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  
}

//-------------------------------FROM WALLET PAGE--------------------------------------------------------------
const depositAmount = async (req,res)=>{

  const { amount } = req.body
  const amountNumber = parseFloat(amount);
  const userId = req.session.user._id

  try{

    let wallet = await walletModel.findOne({ userId });

    if (!wallet) {
      // If wallet doesn't exist, create a new one
      wallet = new walletModel({ userId });
    }

    
    wallet.balance += amountNumber;

    
    wallet.transactions.push({
      amount: amountNumber.toFixed(2),
      status: 'success',
      type: 'credit',
      date: new Date()
    });


    
    await wallet.save();

    req.flash('success', 'Amount deposited successfully')
    res.redirect('/wallet');

  } catch (error) {
      console.error('Error depositing amount:', error);
      res.status(500).json({ message: 'Internal server error' });

  }

}


//-------------------------------------------FROM CHECKOUT PAGE------------------------------------------------------------------
const AddAmountToWallet = async (req, res) => {
  const { amount } = req.body
  const amountNumber = parseFloat(amount);

  const userId = req.session.user._id;

  try {
      let wallet = await walletModel.findOne({ userId });

      if (!wallet) {
          // If wallet doesn't exist, create a new one
          wallet = new walletModel({ userId });
      }

      wallet.balance += amountNumber;

      wallet.transactions.push({
          
          amount: amountNumber.toFixed(2),
          status: 'success',
          type: 'credit',
          date: new Date()
      });

      await wallet.save();

      
      
      res.status(200).json({ message: 'Amount deposited successfully',balance:wallet.balance });

  } catch (error) {
      console.error('Error depositing amount:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}



module.exports= {
  loadlogin,
  loadregister,
  loadhome,
  CreateUser,
  loadProductView,
  loadUserHome,
  logoutUser,
  loadShoplist,
  loadProfile,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress,
  changePassword,
  loadWishlist,
  addToWishlist,
  removeWishList,
  loadWalletHistory,
  depositAmount,
  AddAmountToWallet 
   
}


