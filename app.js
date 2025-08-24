if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const port = process.env.PORT;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
app.engine('ejs',ejsmate);
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET
  },
  touchAfter:24 * 3600
});

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

store.on("error", ()=>{
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOption = {
  store,
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};


app.use(session(sessionOption));
app.use(flash());   // phle flash fir routes aaenge

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// not useful because we created signup route //
// app.get("/demouser", async (req, res)=>{
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username: "delta-student"
//   });

//   let registeredUser = await User.register(fakeUser, "hello");
//   res.send(registeredUser);
// });


// app.use("/", listingRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.get("/", async (req, res, next)=>{
  res.render("listings/home.ejs");
});

app.all("*",(req, res, next)=>{
  next(new expressError(404,"page not found!"));
});

app.use((err, req, res, next)=>{
  let {status = 500, message = "something went wrong"} = err;
  res.status(status).render("listings/error.ejs",{message});
  // res.status(status).send(message);
});

app.listen(port, () => {
  console.log(`server is listening to port ${8080}`);
});
