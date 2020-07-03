const express     = require('express')
const app         = express()
var multer        = require('multer');
var fs            = require('fs');
const mime        = require('mime');
const bodyParser  = require('body-parser');
const { Storage } = require('@google-cloud/storage');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// FIREBASE STORAGE
const storage = new Storage({
  projectId: "fileuploader090",
  keyFilename: "./fileuploader090-firebase-adminsdk-uc8jg-884a6da2a1.json"
});
const bucket = storage.bucket("fileuploader090.appspot.com");


// FILE FILTER
const fileFilter = (req,file,cb) => {
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg')
	cb(null, true);
	else
	cb(null, false);
}

// MULTER CONFIG
var storage2 = multer.memoryStorage();
var upload2 = multer({storage:storage2, limits: {fileSize: 1024*1024*5}, fileFilter:fileFilter});

// ROOT
app.get("/",function(req,res){
		console.log("ROOT");	
		res.render("./uploads.ejs");
});

// UPLOAD POST
app.post("/upload",upload2.single('productImage'),function(req,res){
		//console.log("=======================================");
		// console.log(req.file);
		// console.log(req.file.buffer);
		//console.log("=======================================");
		if(req.file == null || req.file == "undefined"){
			res.send("Image upload error: constraint jpg/jpeg/png (5 MB)");
	}
	else{
		let file = req.file;
		  if (file) {
		    uploadImageToStorage(file).then((success) => {
		      res.status(200).send({
		        status: 'success',
		        url : success
		      });
		    }).catch((error) => {
		      res.send(error);
		    });
		  }
	}
	
});

// UPLOADING FUNCTION
const uploadImageToStorage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No image file');
    }
    let newFileName = `${file.originalname}_${Date.now()}`;

    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      reject('Something is wrong! Unable to upload at the moment.'+error);

    });

    blobStream.on('finish', () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
}

// Server
const port = 27015;
const host = '127.0.0.1';
app.listen(port,host,function(){
	console.log("Server On !!");
});
