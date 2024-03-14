const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const PORT = process.env.PORT || 8080
const dotenv = require("dotenv").config()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express()
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// console.log(process.env.MONGODB_URL);

// datbase connection

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("connet to Database"))
    .catch((err) => console.log(err))

// schema

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    confirmPassword: String,
    image: String,
});

const userModel = mongoose.model("user", userSchema);

app.get("/", (req, res) => {
    res.send("server is running")
})

app.post("/signup", async (req, res) => {

    try {
        const { firstName, lastName, email, password, confirmPassword, image } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match." });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            image,
        });

        const savedUser = await newUser.save();

        res.status(201).json({ message: "User registered successfully.", user: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const userWithoutSensitiveInfo = {
            _id: user._id,
            firstName: user.firstName,   
            lastName: user.lastName,
            email: user.email,
            image: user.image
        };
        // console.log(userWithoutSensitiveInfo);
        
        res.status(200).json({message: "Login successfull", user: userWithoutSensitiveInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const schemaProduct = mongoose.Schema({
    name: String,
    category:String,
    image: String,
    price: String,
    description: String,
  });
  const productModel = mongoose.model("product",schemaProduct)
  
  
  //save product in data 
  //api
  app.post("/uploadProduct",async(req,res)=>{
      // console.log(req.body)
      const data = await productModel(req.body)
      const datasave = await data.save()
      res.send({message : "Upload successfully",datasave})
  })
  
  //
  app.get("/product",async(req,res)=>{
    const data = await productModel.find({})
    res.send(JSON.stringify(data))
  })

app.listen(PORT, () => console.log("server is running at Port " + PORT)) 