require('dotenv').config();
const adminModel= require("../../model/adminModel");
const orderModel= require("../../model/orderModel");
const productModel= require("../../model/productModel");
const userModel= require("../../model/userModel")



//LOAD LOGIN PAGE--------------------------------------------------------------------

const loadlogin = function(req, res) {
  try {

    res.render('admin/admin-login',{ error:req.flash('errorMsg') })

  } catch (error) {

    // Handle the error
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}




//LOAD DASHBOARD--------------------------------------------------------------------------

const loaddashboard = async(req,res)=>{
  try {

    const admin = await adminModel.findOne({email:req.body.email})
    const allOrders = await orderModel.find({})
    const salesDetails = await orderModel.find();
    const allProducts = await productModel.find({})
    const allUsers = await userModel.find({})
    const currentDate = new Date().toISOString().slice(0, 10);

    if (admin) 
    {
      if(admin.password===req.body.password)
      {
        req.session.admin = admin
        res.render('admin/admin-dashboard',{allOrders,allProducts,allUsers,currentDate,salesDetails})
      }else 
      {
        req.flash('errorMsg','Wrong Password')
        res.redirect('/adminlogin')
        
      }

    }else
    {

      req.flash('errorMsg','Admin not found')
      res.redirect('/adminlogin')
    
    } 
  }
  catch (error) 
  {
    
    res.status(500).send("internal server error")
  }
};




//SALES CHART--------------------------------------------------------------------------

const showChart = async (req, res) => {
  try {
    
    const monthlySalesData = await orderModel.aggregate([
      {
        $match: {
          "items.status": "Delivered", 
          "orderDate": {
            $gte: new Date("2024-01-01"), 
            $lt: new Date("2024-12-31")   
          }
        }
      },
      {
        $unwind: "$items" 
      },
      {
        $match: {
          "items.status": "Delivered" 
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$orderDate" }, 
            year: { $year: "$orderDate" }   
          },
          totalAmount: { $sum: "$items.price" }, 
          countDelivered: { $sum: 1 } 
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } } 
    ]);
    
    
    



    const dailySalesData = await orderModel.aggregate([
      { 
        $match: { 
          "items.status": "Delivered", 
          "orderDate": { 
            $gte: new Date("2024-04-01"), 
            $lt: new Date("2024-04-30")   
          } 
        } 
      },
      { 
        $unwind: "$items" 
      },
      { 
        $match: { 
          "items.status": "Delivered" 
        } 
      },
      { 
        $group: { 
          _id: { day: { $dayOfMonth: "$orderDate" } }, 
          totalAmount: { $sum: "$items.price" }, 
          countDeliveredItems: { $sum: 1 } 
        } 
      },
      { $sort: { "_id.day": 1 } } 
    ]);
    
   
    

    // Aggregate order statuses
    const orderStatuses = await orderModel.aggregate([
      { $unwind: "$items" }, 
      {
        $group: {
          _id: "$items.status", 
          count: { $sum: 1 } 
        }
      }
    ]);

    

    // Map order statuses to object format
    const eachOrderStatusCount = {};
    orderStatuses.forEach((status) => {
      eachOrderStatusCount[status._id] = status.count;
    });

    res.status(200).json({
      monthlySalesData,
      dailySalesData,
      eachOrderStatusCount
    });
  } catch (error) {
   
    res.status(500).json({ error: "Internal server error" });
  }
};





//BACK TO DASHBOARD---------------------------------------------------------------------

const backtodashboard =async (req,res)=>{

  if (req.session.admin) 
  
  { const allOrders = await orderModel.find({})
    const allProducts = await productModel.find({})
    const allUsers = await userModel.find({})
    const currentDate = new Date().toISOString().slice(0, 10);
    res.render('admin/admin-dashboard',{allOrders,allProducts,allUsers,currentDate});

  }else 

  {
    res.redirect('/adminlogin');
  }
};



//LOGOUT ADMIN ----------------------------------------------------------------

const logoutadmin = (req,res)=>{
  try{
      req.session.user = null
      res.redirect('/adminlogin')

  }catch(error){  
    res.status(500).json({ error: "Internal server error" });
  }
}




//SALES REPORT---------------------------------------------------------------------

const generateReport = async (req, res) => {
  try {
      
      const { startDate, endDate } = req.query;
      
    
      const orders = await orderModel.find({ orderDate: { $gte: startDate, $lte: endDate } }).populate('items.product');
      
      res.json(orders);

  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
}




//BEST SELLINGS ----------------------------------------------------------------------------

const loadBestSellings = async function(req, res) {
  try {

      const bestSellingProducts = await orderModel.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }, 
            {
                $lookup: {
                    from: 'products', 
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $addFields: {
                    productDetails: { $arrayElemAt: ['$productDetails', 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    totalQuantity: 1,
                    productDetails: 1
                }
            }
        ]);


      const bestSellingCategories = await orderModel.aggregate([
          { $unwind: '$items' },
          {
              $lookup: {
                  from: 'products',
                  localField: 'items.product',
                  foreignField: '_id',
                  as: 'productDetails'
              }
          },
          { $unwind: '$productDetails' },
          {
              $group: {
                  _id: '$productDetails.category',
                  totalQuantity: { $sum: '$items.quantity' }
              }
          },
          { $sort: { totalQuantity: -1 } },
          { $limit: 5 }, 
          {
              $lookup: {
                  from: 'categories', 
                  localField: '_id',
                  foreignField: '_id',
                  as: 'categoryDetails'
              }
          },
          {
              $addFields: {
                  categoryDetails: { $arrayElemAt: ['$categoryDetails', 0] }
              }
          },
          {
              $project: {
                  _id: 0,
                  categoryId: '$_id',
                  totalQuantity: 1,
                  categoryName: '$categoryDetails.name'
              }
          }
      ]);



      const bestSellingBrands = await orderModel.aggregate([

        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $group: {
                _id: '$productDetails.brand',
                totalQuantity: { $sum: '$items.quantity' }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 8 }, // Adjust the limit as needed
        {
            $project: {
                _id: 0,
                brandName: '$_id',
                totalQuantity: 1
            }
        }
      ]);
    

    res.render('admin/bestSellings',{
      BSP: bestSellingProducts,
      BSC: bestSellingCategories,
      BSB: bestSellingBrands
    })

  } catch (error) {

    
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}





module.exports= {
  loadlogin,
  loaddashboard,
  backtodashboard,
  logoutadmin,
  generateReport,
  loadBestSellings,
  showChart
}
