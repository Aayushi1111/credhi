const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/'});
const fs = require('fs');
const Post = require('./models/Post');

const salt = bcrypt.genSaltSync(10);
const secret = 'aiofuasu9872hjaekh';

app.use(cors({credentials: true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://mnr_blog:VoXS1ExOgxNYszlT@cluster0.nvasair.mongodb.net/?retryWrites=true&w=majority');

const allowedOrigins = ["http://localhost:3000", "http://localhost:4001"];

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                var msg =
                    "The CORS policy for this site does not " +
                    "allow access from the specified Origin.";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    })
);

app.post('/register', async (req,res)=> {
    const {username,password} = req.body;
    try{
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password,salt),  
        });
        res.json(userDoc);
    }
    catch(e){
        console.log(e)
        res.status(400).json(e);
    }
    
});

app.post('/login', async (req,res) => {
    const {username,password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk){
        jwt.sign({username, id: userDoc._id}, secret, { }, (err,token) =>{
            if(err) throw err;
            res.cookie('token',token).json({
                id:userDoc._id,
                username,
            });
        });
    }
    else{
        res.status(400).json('wrong credentials');
    }

});

app.get('http://localhost:4001/profile', (req,res) =>{
    const {token} = req.cookies;
    jwt.verify(token, secret,(err, info) => {
        if (err) throw err;
        res.json(info);
    });

});

app.post('http://localhost:4001/logout', (req, res) => {
    try {
      res.cookie('token').json('ok');
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path,newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret,async (err, info) => {
        if (err) throw err;
        const{title,summary,content} = req.body;
        const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
    
    });
    res.json(postDoc);
    });
});

app.get('/post', async (req,res) => {
    res.json(await Post.find()
    .populate('author',['username'])
    .sort({createdAt: -1})
    .limit(20)
    );    
});

app.get('/post/:id', async(req,res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

app.listen(4001);