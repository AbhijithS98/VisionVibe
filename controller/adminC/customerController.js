const userModel= require("../../model/userModel")

const loadcustomerlist =async(req,res)=>{

  try {
    const users= await userModel.find({})

    res.render("admin/customerlist",{data:users})
  } 

  catch (error) {
    {
     
      res.status(500).send("internal server error")
    }
  }
}



const blockOrUnblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const User = await userModel.findOne({ _id: id });

    if (!id || !User) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    if (User.isActive === true) {
      await userModel.updateOne({ _id: id }, { $set: { isActive: false } });
      return res.json({ success: true, flag: 1 });
    } else {
      await userModel.updateOne({ _id: id }, { $set: { isActive: true } });
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
  loadcustomerlist,
  blockOrUnblockUser,

}