// const express = require("express");
// const multer = require('multer');
// const path = require('path');
// const app = express();
// app.use(express.urlencoded({ extended: true}));
// app.use(express.static("public"));
// const mongoose = require("mongoose");
// app.set('view engine', 'ejs');
// app.use(express.json());
//
// // Set up storage for the car images
// const storage = multer.diskStorage({
// destination: function(req, file, cb) {
// cb(null, 'public/images/cars');
// },
// filename: function(req, file, cb) {
// cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
// }
// });
//
// const upload = multer({ storage });
//
// mongoose.connect('mongodb://localhost/car_rental_final', { useNewUrlParser: true, useUnifiedTopology: true });
//
// const carSchema = new mongoose.Schema({
// name: String,
// year: String,
// model: String,
// km: String,
// notes: String,
// image: String
// });
// const carModel = new mongoose.model("cars", carSchema);
//
// app.get("/", function(req, res){
// res.render("home");
// });
// app.get("/cars", function(req, res){
// carModel.find({}, function(err, data){
// if (err) {
// console.log("data send err");
// } else {
// res.render("cars", {cars: data});
// }
// });
// });
// app.post("/cars", upload.single('image'), function(req, res){
//
//   const { name, year, model, km, notes } = req.body;
//   const imgPath = req.file.path;
//   const newCar = new carModel({
//     name,
//     year,
//     model,
//     km,
//     notes,
//     image: imgPath
//   });
//   newCar.save();
//   res.redirect("/cars");
// });
// app.listen(3000, function() {
// console.log("server is working");
// });


const express = require("express");
const multer = require('multer');
const path = require('path');
const app = express();
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));
// app.use('public/images/cars',express.static('./public/images/cars'));
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
app.set('view engine', 'ejs');
app.use(express.json());
const http =require("http");
const hostname = 'startngo.eu';
const port = 443;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

// Set up storage for the car images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/images/cars');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

mongoose.connect('mongodb+srv://admin:admin2023@startngo.bpx96yy.mongodb.net/car_rental_final', { useNewUrlParser: true, useUnifiedTopology: true });

const carSchema = new mongoose.Schema({
  name: String,
  year: String,
  model: String,
  km: String,
  notes: String,
  rented : String,
  oilcahnge : String ,
  plate : String,
  seats: String,
  images: [String]
});
const carModel = new mongoose.model("cars", carSchema);

const tenantSchema = new mongoose.Schema({
  name : String,
  tid : String,
  startDate : String,
  endDate : String,
  phoneNumber : String,
  carDetails : [carSchema]
});
const tenantmodel = new mongoose.model("tenant" , tenantSchema);


let mailTransporter = nodemailer.createTransport({
  service : "gmail",
  auth : {
    user : "yazeedbajawi65@gmail.com",
    pass : "imgwkspbgdvvdwbw"
  }
})

app.get("/", function(req, res){
  res.render("login");
});


app.post("/login" , function(req,res){

if(req.body.username == "admin@admin.com" && req.body.password == "admin2023"){
  carModel.find({},function(err,d){
    if(err){
      console.log(err);
    }else {
      tenantmodel.find({}, function(err,users){
        if(err){
          console.log("users data error");
        }else{
          res.render("dashboard" , {cars : d  , users : users});

        }
      });

    }
  });
}else {
  res.send("wrong username or password");
}
});

app.get("/dash" , function(req,res){
  carModel.find({},function(err,d){
    if(err){
      console.log(err);
    }else {
      tenantmodel.find({}, function(err,users){
        if(err){
          console.log("users data error");
        }else{
          res.render("dashboard" , {cars : d  , users : users});

        }
      });

    }
  });
});

app.get("/cars", function(req, res){
  carModel.find({}, function(err, data){
    if (err) {
      console.log("data send err");
    } else {
      res.render("cars", {cars: data});
    }
  });
});

app.get("/users" , function(req,res){
  tenantmodel.find({}, function(err,userss){
    if(err){
      console.log(err);
    }else {
      res.render("users" , {users : userss});
    }
  });
});


app.get("/Addacar" , function(req,res){
  res.render("add");
});

app.post("/Addacar", upload.array('images', 5), function(req, res){
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const { name, year, model, km, notes, plate,seats } = req.body;
  const imagePaths = req.files.map(file => path.join("images/cars", file.filename));
  const newCar = new carModel({
    name,
    year,
    model,
    km,
    plate,
    seats,
    notes,
    rented : "not rented",
    oilcahnge :"0",
    images: imagePaths
  });
  newCar.save();
  res.redirect("/cars");
});

app.post("/carrent" , function(req,res){


  const carrent = req.body.carrent;
  console.log(carrent);

  carModel.find({_id : carrent} , function(err,results){
    if(err){
      console.log(err);
    }else {
      res.render("rent" , {arr : results});
    }
  });


});

app.post("/rent" , function(req,res){

carModel.findByIdAndUpdate(req.body.id ,{$set :{rented : "rented"}}, {new:true}  , function(err,doc){
  if (err) {
    console.log(err)
  }else {
    console.log("updated" , doc);
  }
});



const newTenant = new tenantmodel({
  name : req.body.renname,
  tid : req.body.renid,
  startDate : req.body.rendates,
  endDate : req.body.rendatee,
  carDetails : [ {
    name : req.body.name,
    year : req.body.year,
    model : req.body.model,
    km : req.body.km,
    notes : req.body.notes
  }
  ]


});

newTenant.save();
res.redirect("/cars");



});
app.get("/rented" , function(req,res){
  carModel.find({rented : "rented"} , function(err,rentdata){
    if (err) {
      console.log(err);

    }else {
      res.render("rentedcars" , {arr : rentdata});
    }
  });
} );

app.get("/notrented" , function(req,res){
  carModel.find({rented : "not rented"} , function(err,rentdata){
    if (err) {
      console.log(err);

    }else {
      res.render("cars" , {cars : rentdata});
    }
  });
} );


app.post("/revokerent" , function (req,res){

let deatils = {
  from :  "yazeedbajawi65@gmail.com",
  to : "toxicyazeed@gmail.com",
  subject : "oil change is required",
  text : "you really need to change car oil"


}


  carModel.findByIdAndUpdate(req.body.carrent , {rented : "not rented" , oilcahnge : req.body.oilcahnge } , function(err,doc){
    if (err) {
      console.log(err)
    }else {
      if(true) {
        mailTransporter.sendMail(deatils,function(err){
          if (err){
            console.log("err");
          }else {
            console.log("email sent!")
          }
        });
      }else {
        console.log(typeof(req.body.oilcahnge) + "" + parseInt(req.body.oilcahnge, 10));
      }

      console.log("updated" , doc);
      res.redirect("/dash");
    }
  });
});


app.get("/del" , function(req,res){
  carModel.find({}, function(err, data){
    if (err) {
      console.log("data send err");
    } else {
      res.render("del", {cars: data});
    }
  });
});
app.post("/del" , function(req,res){
  carModel.findByIdAndDelete(req.body.cardel, (err, deletedDoc) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Deleted document: ${deletedDoc}`);
    res.redirect("/dash"); 
  }
});
});
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });


app.listen(3000, function() {
  console.log("server is working");
});
