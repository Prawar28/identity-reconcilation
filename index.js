const express = require('express');
const bodyParser = require('body-parser');
const contactRoutes = require('./routes/contacts');

const app = express();

app.use(bodyParser.json());
app.use('/api', contactRoutes);

app.get('/ping', async (req, res) => {
    res.status(200).json('pong');
})
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
