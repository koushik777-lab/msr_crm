const AdminModel = require("../models/Admin");
const { validateJwtToken } = require("./helpers");


const AdminAuthMiddleware= async(req,  res, next)=> {
    try {
        let token = req.headers.authorization;

        if(!token ){
            return res.status(401).json({message: "Unauthorized Request"})
        }
        token = token.split(" ")[1];
        const decoded = await validateJwtToken(token);
    //    const admin = await AdminModel.findById(decoded.user._id);
    //    if(admin){

           req.user =  decoded.user;
           req.isAgent = decoded.isAgent;
           next();

    //    }
    //    else {
            //   return res.status(401).json({message: "Unauthorized Request"})
    //    }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: error.message})
    }
}



module.exports={AdminAuthMiddleware};