const express = require("express");
const session = require("express-session");
const app = express();
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const path = require("path");
const flash = require("express-flash");
const { v4: uuid4 } = require("uuid");
const methodOverride = require("method-override");
const userAuthRoute = require("./routes/userRouter");
const adminAuthRoute = require("./routes/adminRouter");


//setup database connection
const db = mongoose.connect(process.env.DB_URL);
db.then(() => {
  console.log("Database connected");
}).catch(() => {
  console.log("Error in connecting to database");
});

//mounting middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


//session & flash setup
app.use(
  session({
    secret: uuid4(),
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());



//setup view engine & static file serving
app.use("/public", express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//requiring routerfile
app.use("/", userAuthRoute);
app.use("/", adminAuthRoute);


app.get('*',(req, res)=>{
  res.status(404).render('404.ejs');
});

//starting server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log("Listening to server http://localhost:3000");
});
