const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const apiRouter = require('./api/api');

require('dotenv').config();
require('./config/db');

const app = express();
const uploadsPath = path.join(__dirname, 'uploads');
const port = process.env.PORT || 6000;

app.use(morgan('common')); 
app.use(cors({
	origin: process.env.CORS_ORIGIN,
	exposedHeaders: ['access-token', 'refresh-token'],
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', apiRouter);
app.use('/uploads', express.static(uploadsPath));

app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`Listening on port ${port}`);
});