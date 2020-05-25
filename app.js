const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
app.use(bodyParser.urlencoded({
  extended: true
}));
const https = require("https");
app.set('view engine', 'ejs');
var _ = require('lodash');

app.use(express.static("public"));
app.use(session({
  secret: "Our Little Secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-tannen:Paisley@cluster0-k0mtj.mongodb.net/Main", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);

// ACCount

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  age: Number,
  tutor: false,
  accountCreationTime: Date
});

const inboxSchema = new mongoose.Schema({
  senderUsername: String,
  senderUserID: String,
  subject: String,
  aboutYourself: String,
  previousLearning: String,
  whatHelp: String,
  time: String,
  mssgSendTime: Date
});

const Inbox = mongoose.model("Inbox", inboxSchema);

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});



//LOGIN LOGOUT



app.get("/login", function(req, res) {
  if(req.isAuthenticated()){
    res.redirect("/secrets");
  }else{
      res.render("login", {loginFailure: ""});
  }
});

app.get("/signup", function(req, res) {
  res.render("signup", {signupFailure: ""});
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.sendFile(__dirname + "/loggedIn.html")
  } else {
    res.redirect("/login");
  }
});

app.post("/signup", function(req, res){

  if(isNaN(req.body.age)){
    res.render("signup", {signupFailure: "Please have age as a number"})
  }else{
    if(req.body.tutorCheck === "on"){
      var checked = true;
    }else{
      var checked = false;
    }
    console.log(req.body.tutorCheck);
  User.findOne({username: req.body.username}, function(err, foundUsers){
      if(foundUsers === null){
        User.register({username: req.body.username, age: req.body.age, tutor: checked, accountCreationTime: Date.now()}, req.body.password, function(err, user){
          if(err){
            console.log(err);
            res.redirect("/signup");
          }else{
            passport.authenticate("local")(req, res, function(){
              res.redirect("/secrets");
            });
          }
        })
    }else{
      res.render("signup", {signupFailure: "That email is already asigned to an account"});
    }
})}
});

app.post("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post('/login', (req, res, next) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password,
    age: null,
    tutor: null
  });

  passport.authenticate('local',
  (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.render("login", {loginFailure: info.message});
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      return res.redirect('/secrets');
    });

  })(req, res, next);
});

//Pick Tutor


app.get("/getTutor", function(req, res){
  res.render("getTutor", {});
});

app.get("/getMath", function(req, res){
  if(req.isAuthenticated()){
    res.render("getMath", {});
  }else{
    res.redirect("/login");
  }
});

app.post("/getMath", function(req, res){
  const message = new Inbox({
    senderUserID: req.user._id,
    senderUsername: req.user.username,
    subject: "Math",
    aboutYourself: req.body.aboutYourself,
    previousLearning: req.body.previousLearning,
    whatHelp: req.body.whatHelp,
    time: req.body.time,
    mssgSendTime: Date.now()
  });
  message.save();
});

app.get("/getEnglish", function(req, res){
  res.render("getEnglish", {});
});

app.post("/getEnglish", function(req, res){
  const message = new Inbox({
    senderUserID: req.user._id,
    senderUsername: req.user.username,
    subject: "English",
    aboutYourself: req.body.aboutYourself,
    previousLearning: req.body.previousLearning,
    whatHelp: req.body.whatHelp,
    time: req.body.time,
    mssgSendTime: Date.now()
  });
  message.save();
});

app.get("/getETC", function(req, res){
  res.render("getEtc", {});
});

app.post("/getEtc", function(req, res){
  const message = new Inbox({
    senderUserID: req.user._id,
    senderUsername: req.user.username,
    subject: "Etc",
    aboutYourself: req.body.aboutYourself,
    previousLearning: req.body.previousLearning,
    whatHelp: req.body.whatHelp,
    time: req.body.time,
    mssgSendTime: Date.now()
  });
  message.save();
});






// INBOX MANAGEMENT


app.get("/inbox", function(req, res){
  if(req.isAuthenticated()){
      Inbox.find({}, function(err, foundMssgs){
        res.render("inbox", {foundMssgs: foundMssgs});
      });
    }
  else{
    res.redirect("/login");
  }

});


app.get("/sendMessage", function(req, res){
if(req.isAuthenticated()){
  res.render("sendMessage", {});
}else{
  res.redirect("/login");
}
});

app.post("/sendMessage", function(req, res){
  const message = new Inbox({
    senderUserID: req.user._id,
    senderUsername: req.user.username,
    recieverUsername: req.body.reciever,
    message: req.body.message
  });
  message.save();
});




    app.listen(process.env.PORT || 3000, function() {
      console.log("Server running");
    });
