const express = require('express');
const router = express.Router();
const { identify } = require('../services/contactService.js');

router.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    const result = await identify({ email, phoneNumber });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
