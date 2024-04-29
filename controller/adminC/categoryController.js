const categoryModel = require('../../model/categoryModel')


const loadcategorylist =async function(req,res){
  try 
  {
    const data =await categoryModel.find()
    const { errMsg } = req.flash();
    const {message} = req.session;
    delete req.session.message;
    
    res.render('admin/categorylist',{ data: data, error: errMsg, message:message })

  }catch (error) 
  {
    console.error("Error fetching category data:", error);
    // Handle the error appropriately, e.g., return an error page
    res.status(500).send("Internal Server Error");
  }
};


const addCategory =async(req,res)=>{
  try
  {
    
    const name = req.body.categoryName;
    const description = req.body.description
    const categoryExist = await categoryModel.findOne({name:name})
      
       
      if (!categoryExist) 
      {
        const categoryadded = {
        name:name,
        description:description,
        islisted:true
        }   
        await categoryModel.create(categoryadded)
        req.session.message = "New Category Added"
        res.redirect("/categorylist",)
       
      }else{
        req.flash('errMsg','Category Already Exists')
        res.redirect("/categorylist") 
      } 
  } catch (error) {
    
    console.error("Error fetching category data:", error);
    
    res.status(500).send("Internal Server Error");
  }
};


const loadeditCategory= async(req,res)=>{
  try{
    const id =req.query.id
    const Category =await categoryModel.find({_id:id})
    
    const {errMsg} = req.flash()
    res.render("admin/categoryedit",{category:Category, error:errMsg})
    
  }catch (error){

    res.status(500).send("Internal Server Error");
  }
}


const updateCategory= async(req,res)=>{
try
{
  const id= req.params.id
  const category= req.body;
  
  const existingCategory= await categoryModel.findOne({name:category.categoryName})

  if(!existingCategory || existingCategory._id.toString() === id){
    await categoryModel.findByIdAndUpdate(id, {
      name: category.categoryName,
      description: category.description,
    })
    req.flash("message", "Category updated successfully")
    res.redirect('/categorylist')
  } 
  else {
    req.flash("errMsg", "Category with the same name already exists");
    res.redirect(`/editCategory?id=${id}`)
  }

}
catch (error)
{
  console.error("Error updating category:", error.message);
  res.status(500).send("Internal Server Error");

}}


const unlistorlist = async (req, res) => {
  try {
     
      const id = req.query.id;
      
      const category = await categoryModel.findById(id);
      

      if (category.islisted === true) {
          await categoryModel.findByIdAndUpdate(id, {
              islisted: false
          });
          res.json({success:true,flag:0})
      }else{
        await categoryModel.findByIdAndUpdate(id, {
          islisted: true
        
      });
      res.json({success:true,flag:1})
      }

      
  } catch (error) {
     
      res.json({ success: false, message: error.message }); 
  }
};
module.exports={
  loadcategorylist,
  addCategory,
  unlistorlist,
  loadeditCategory,
  updateCategory
}