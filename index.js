const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express()
const port = 3005;


app.use(express.json());
app.use(cors());



const SECRET = 'my-secret-key';

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const ADMINS = mongoose.model('ADMINS', userSchema);

mongoose.connect('mongodb+srv://saurav:18503320@cluster0.sd0gzbf.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courseselling" });

const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.email = email;
        next();
      });
    } else {
      res.sendStatus(401);
    }
};



app.post('/admin/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const admin = await ADMINS.findOne({ email: email });
        console.log("admin signup");

        if (admin) {
            res.status(403).json({ message: 'Admin already exists' });
        } else {
            const newAdmin = { username, email, password };
            await ADMINS.create(newAdmin);
            const token = jwt.sign({ email, role: 'admin' }, SECRET, { expiresIn: '1h' });
            res.json({ message: 'Admin created successfully', token });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await ADMINS.findOne({ email: email, password: password });
        if (admin) {
            const token = jwt.sign({ email, role: 'admin' }, SECRET, { expiresIn: '1h' });
            res.json({ message: 'Logged in successfully', token });
        } else {
            res.status(403).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});








app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})