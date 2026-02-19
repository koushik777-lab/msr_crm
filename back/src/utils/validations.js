
const AdminModel = require("../models/Admin");
const AgentModel = require("../models/Agents");
const { comparePassword } = require("./helpers");



async function signUpvalidations(email){
    try {
        const isUserExist = await AdminModel.findOne({
            email: email
        });

      
        if(isUserExist){
            return true;
        }
        return false;
    } catch (error) {
        console.log(error.message);   
    }

}

async function createAgentValidations(body){
    try {
if(!body.name || !body.email || !body.phoneNumber || !body.password){
    throw new Error("All fields are required");
}
if(body.password.length <8){
    throw new Error("Password must be at least 8 characters");
}
if(body.phoneNumber.length !=10){
    throw new Error("Phone number must be of 10 digits");
}
if(body.email.includes("@") === false || body.email.includes
(".") === false){
    throw new Error("Invalid email address");
}
        const isAgentExist= await AgentModel.findOne({email: body.email});
        const isPhoneNumberExists= await AgentModel.findOne({phoneNumber: body.phoneNumber});

        if(isAgentExist){
throw new Error("Email already exist");
        }
        if(isPhoneNumberExists){
            throw new Error("Phone number already exist");
        }
     else   return {status: true};
    } catch (error) {
       
        return {status: false, message: error.message};
      
    }
}

function updateAgentValidations( body){
    if(body.email && (!body.email.includes("@") || !body.email.includes("."))){
        throw new Error("Invalid email address");
    }
    if(body.phoneNumber && body.phoneNumber.length !=10){
        throw new Error("Phone number must be of 10 digits");
    }
    if(body.password){
        if(!body.newPassword){
            throw new Error("Please provide new password");
        }
        if(body.newPassword== body.password){
            throw new Error("New password must be different from the old password");
        }
        if(body.newPassword.length <8){
            throw new Error("New Password must be at least 8 characters");
        }
    }
}



module.exports= {signUpvalidations,createAgentValidations, updateAgentValidations};