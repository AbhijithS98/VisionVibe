const ProductModel = require("../../model/productModel");
const CategoryModel = require("../../model/categoryModel");

const loadproductlist = async function (req, res) {
  try {
    const products = await ProductModel.find().populate("category").sort({createdOn:-1});
   
    res.render("admin/productlist", { data: products });
  } catch (error) {
    console.error("Error fetching product data:", error);
    // Handle the error appropriately, e.g., return an error page
    res.status(500).send("Internal Server Error");
  }
};

const loadproductadd = async (req, res) => {
  try {
    if (req.session.admin) {
      const category = await CategoryModel.find({ islisted: true });
      // const brand = await brandModel.find({isBlocked:false})
      // const errormessage = req.flash("errormessage")
      res.render("admin/productadd", { cat: category });
    } else {
      res.redirect("/adminlogin");
    }
  } catch (error) {

    res.status(500).send("Internal Server Error");
  }
};



const loadproductedit = async (req, res) => {
  try {

    const id = req.query.id;
    const foundproduct = await ProductModel.findOne({ _id: id });
    const category = await CategoryModel.find({});
  
    const {errMsg} = req.flash()
    res.render("admin/productedit", { product: foundproduct,cat: category,error: errMsg });
  } catch (error) {

    console.error("Error fetching product data:", error);
    // Handle the error appropriately, e.g., return an error page
    res.status(500).send("Internal Server Error");
  }
}


const addproducts = async (req, res) => {
  try {
   
    const product = req.body;
    const { productName } = req.body;
    const trimmedProductName = productName.trim();

    const productExist = await ProductModel.findOne({
      productName: trimmedProductName,
    });

    if (productExist) {
      const message ="cannot add duplicate product , product  exist with same name ";
      return res.json({ status: false, message: message });
    }

    if (!productExist) {
     

      const images = [];

      if (req.files && req.files.length > 0) {
          // Image validation
          for (let i = 0; i < req.files.length; i++) {
              const file = req.files[i];
              
      
              // Check if the file is an image (only allow image/jpeg, image/png, and image/gif)
              if (!(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif')) {
                  
                  const errormessage = "Cannot Add product. Please upload images in JPEG, PNG, or GIF format only.";
                  return res.json({ success: false, fileerrormessage: errormessage });
              }
      
              // Add filename to the images array
              images.push(file.filename);
            }
    }

      const productAdding = {
        id: Date.now(),
        brand: product.brandName,
        productName: productName,
        description: product.description,
        category: product.category,
        regularPrice: product.regularPrice,
        discount: product.discount,
        createdOn: Date.now(),
        productImage: images,
        inStock: product.inStock,
      };

      await ProductModel.create(productAdding);
      const message = "product added successfully";
      return res.json({ success: true, message: message }); // Terminate function execution
    } else {
      // Product already exists
      const errormessage = "Cannot Add product Already exist";
      return res.json({ success: false, errormessage: errormessage }); //
    }
  } catch (error) {
    
    res.status(500).json({ error: error.message });
  }
};



const updateproducts = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    
    const images = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images.push(req.files[i].filename);
      }
    }

    if (req.files.length > 0) {
      const prodata = await ProductModel.findById({ _id: id });
      prodata.productImage.push(...images);
      prodata.save();
      
    }

    // Check if a product with the same name exists
    const duplicate = await ProductModel.findOne({ productName: data.productName,_id: { $ne: id },})

    if (!duplicate || duplicate._id.toString() === id) {
    

      // Update product data
      await ProductModel.findByIdAndUpdate(
        id,
        {
          productName: data.productName,
          description: data.description,
          brand: data.brandName,
          category: data.category,
          regularPrice: data.regularPrice,
          discount: data.discount,
          inStock: data.inStock,
          
        },
        { new: true }
      );

      req.flash("message", "Product Edit successfully");
      res.redirect("/productlist");
    } else {

      req.flash("errMsg","Product exists with the same name. Please choose a different name.");
      res.redirect(`/productedit?id=${duplicate._id}`);

    }
  } catch (error) {

    console.error(error.message);
  }
};


const listOrUnlistProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await ProductModel.findOne({ _id: id });

    if (!id || !product) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    if (product.isBlocked === false) {
      await ProductModel.updateOne({ _id: id }, { $set: { isBlocked: true } });
      return res.json({ success: true, flag: 1 });
    } else {
      await ProductModel.updateOne({ _id: id }, { $set: { isBlocked: false } });
      return res.json({ success: true, flag: 0 });
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


const deleteImage = async (req, res) => {
  try {
      const productId = req.params.productId;
      const index = parseInt(req.params.index);

      // Find the product by ID
      const product = await ProductModel.findById(productId);

      // Remove the image at the specified index from the product's image array
      if (index >= 0 && index < product.productImage.length) {
          product.productImage.splice(index, 1);

          // Save the updated product
          await product.save();

          res.status(200).send('Image deleted successfully');
      } else {
          res.status(400).send('Invalid image index');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Failed to delete image');
  }
};





const applyProductOffer = async (req, res) => {

  const {productId} = req.query;
  
  const {deduction} = req.query;
  

 try{

  // Find the product by productId
  const product = await ProductModel.findById(productId);
  

  // Check if the product exists
  if (!product) {
    return res.status(400).send('Invalid product Id');
  }
  
  if(!deduction){
    return res.status(400).send('enter a valid amount');
  }
  // Update oldPrice with the current regularPrice
  product.oldPrice = product.regularPrice;

  // Update regularPrice by subtracting the deduction amount
  product.regularPrice -= deduction;
  product.discount = deduction;

  
  await product.save();

  
  res.status(200).send('Discount applied successfully');
  

 }catch (error){

      console.error(error);
      res.status(500).send('Failed to apply discount');

 }

};



module.exports = {
  loadproductlist,
  loadproductadd,
  addproducts,
  listOrUnlistProduct,
  loadproductedit,
  updateproducts,
  deleteImage,
  applyProductOffer
};
