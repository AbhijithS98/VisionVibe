const userModel = require("../model/userModel");
const walletModel = require('../model/walletModel')
const bcrypt = require("bcrypt");




// const doSignUp = (userData, verify,emailVerify) => {

//   return new Promise(async (resolve, reject) => {

//       const userExist = await userModel.findOne({
//         $or: [{ email: userData.email }, { mobile: userData.mobile }],
//       });
//       console.log("Hello");

//             if(emailVerify===userData.email){
              
//                     if (!userExist) {

//                       console.log("user not exist");
//                       console.log(userData.password +" "+userData.confirmPassword)
                              
//                               if (userData.password === userData.confirmPassword) {
//                                 console.log("password matched");
//                                 console.log(verify);

//                                     if (verify) {  //otp verification
//                                      console.log("verfied");

//                                             try {
                                          
//                                                   const password = await bcrypt.hash(userData.password, 10);
//                                                   const userd = {
//                                                     name: userData.username,
//                                                     email: userData.email,
//                                                     mobile: userData.mobile,
//                                                     password: password,
//                                                     isVerified: true,
//                                                   };
//                                                   userModel.create(userd)
                                                    
//                                                   .then((data) => {
//                                                       const response = { status: true, message: "Signed Up Successfully" };
//                                                       console.log(data);
//                                                       resolve(response);
//                                                   })
//                                                   .catch((error) => {
//                                                       console.log(error);
//                                                       reject(error);
//                                                   });
//                                             } catch (error) {
//                                               console.log(error.message);
//                                               reject(error);
//                                             }
//                                     } else {
//                                       response.status =false,
//                                       response.message="OTP Doesnt match";
//                                       resolve(response);
//                                     }
//                               }else{
//                                 response.status = false;
//                                 response.message = "Password doesn't Match"
//                                 resolve(response)
//                               }
//                     } else {
//                       response.status=false;
//                       response.message="User already Exists";
//                       resolve(response);
//                     }
//             }else{
//             response.status =false;
//             response.message = "Email not matched"
//             resolve(response)
//             }
//   });
// };





const doSignUp = (userData, verify,emailVerify) => {

  return new Promise(async (resolve, reject) => {

      const userExist = await userModel.findOne({
        $or: [{ email: userData.email }, { mobile: userData.mobile }],
      });
    

            if(emailVerify===userData.email){
              
                    if (!userExist) {

                              
                              if (userData.password === userData.confirmPassword) {
                              

                                    if (verify) {  //otp verification
                                    

                                            try {
                                          
                                                  const password = await bcrypt.hash(userData.password, 10);
                                                  const userd = {
                                                    name: userData.username,
                                                    email: userData.email,
                                                    mobile: userData.mobile,
                                                    password: password,
                                                    isVerified: true,
                                                  };
                                                  const newUser = await userModel.create(userd);
                                                    
                                                  // Check if referral code is valid
                                                  if (userData.referalCode) {
                                                      const referredByUser = await userModel.findOne({ referalCode: userData.referalCode });
                                                      if (referredByUser) {
                                                            const transaction = {                                                   
                                                              amount: 1000,
                                                              status: "referal",
                                                              type: "credit",
                                                              date: new Date()
                                                            }
                                                            const wallet = new walletModel({
                                                              userId: newUser._id,
                                                              balance: 1000,
                                                              transactions: [transaction],
                                                              referalCode: userData.referalCode,
                                                            });
                                                            
                                                                let refererWallet = await walletModel.findOne({ userId:referredByUser._id })
                                                                if(refererWallet){

                                                                      refererWallet.balance += 1000
                                                                      refererWallet.transactions.push(transaction)
                                                                }else{

                                                                  refererWallet = new walletModel({
                                                                    userId: referredByUser._id,
                                                                    balance: 1000,
                                                                    transactions: [transaction],
                                                                    
                                                                  });
                                                                }
                                                                
                                                            await wallet.save();
                                                            await refererWallet.save();
                                                      } else {
                                                        const response = { status: false, message: "Invalid referral code" };
                                                        resolve(response);
                                                      }
                                                  }

                                                  const response = { status: true, message: "Signed Up Successfully" };
                                                  console.log(newUser);
                                                  resolve(response);
                                            } catch (error) {
                                              console.log(error.message);
                                              reject(error);
                                            }
                                    } else {
                                      const response = { status: false, message: "OTP Doesnt match" };
                                      
                                      resolve(response);
                                    }
                              }else{
                                const response = { status: false, message: "Password doesn't Match" };
                                
                                resolve(response)
                              }
                    } else {
                      const response = { status: false, message: "User already Exists"};
                    
                      resolve(response);
                    }
            } else{
             const response = { status: false, message: "Email not matched"};
           
             resolve(response)
            }
  });
};

module.exports = {
  doSignUp,

}