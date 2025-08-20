// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); 
    
    //if user not find or length 0
    if (!users || users.length === 0) {
      return res.status(404).send("No users found");
    }

    res.status(200).json({ users }); // keys should be lowercase by convention
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;



