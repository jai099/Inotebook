const express = require('express');
const router = express.Router();
const User = require('../models/Users')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')
const JWT_SECRET = 'Thisismysecretkey';


//ROUTE 1: create a new user using "/api/auth/createuser"
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password length must be greater than 5').isLength({ min: 6 })
], async (req, res) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });

    }

    // Checks if a user with this email already exists  
 try {
    let user = await User.findOne({ email: req.body.email });
    if (user) { 
        return res.status(400).json({message:"User already exists"});
     }
     const salt= await bcrypt.genSalt(10)
     const secpass= await bcrypt.hash(req.body.password,salt)
     user = await User.create({
         name: req.body.name,
         password: secpass,
         email: req.body.email,
     });
     const data = {
         user: {
             id: user.id
         }
     };
     const authtoken = jwt.sign(data, JWT_SECRET);

     return res.json({authtoken})
 } catch (error)
 {
     console.error(error.message)
     res.status(500).json({ message: "Error Occured" });
 } 
    

    res.json({ User, "Message": "User created successfully" });
});


// ROUTE2: Authenticating  a user using "/api/auth/login"

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        console.log("Validation errors: ", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user =await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: "Please enter  valid credentials" });

        }

        const passwordcompare = await bcrypt.compare(password, user.password);
        if (!passwordcompare) {
            return res.status(400).json({ errors: "Please enter valid credentials" })
        }
        const data =
        {
            user:
            {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        return res.json({ authtoken })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Some Error Occured" });

    }
     });

//ROUTE3: Get loggedin user details using : POST "/api/auth/getuser"
router.post('/getuser', fetchuser ,async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")  
        res.send(user)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
}
)  
module.exports = router;