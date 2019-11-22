var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = {
	secret: 'hey_eda',
	name: 'edacmsSid',
	cookie: {
		httpOnly: false
	},
	resave:false,
	store: new mongoStore({
		mongooseConnection: mongoose.connection
	}),
	saveUninitialized: false
};