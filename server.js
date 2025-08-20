const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
connectDB();
app.use(express.json());




//routes import 

const auth=require('./routes/auth')
const protected=require('./routes/protected')
const getallusers=require('./routes/getuser')

// Routes
app.use('/api/auth',auth)
app.use('/api/protected',protected);
app.use('/api/get',getallusers)

app.get('/',(req,res)=>{
    res.send("hey there")
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
