var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
require('./utils/connection');

const { google } = require('googleapis');
const session = require('express-session');




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
var addtaskRouter = require('./routes/addtask');
var getTasksRouter = require('./routes/getTasks');
var changeStatusRouter = require('./routes/changeStatus');
var getPositionsRouter = require('./routes/getPositions');
var deleteTaskRouter = require('./routes/deletetask');
var updatetaskRouter = require('./routes/updateTask');
var updateDetailsRouter = require('./routes/updateDetails');
var Comments = require('./routes/comments');
var Notes = require('./routes/notes');
var Invitation = require('./routes/invitationtask');

var app = express();
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type'
}));

app.use(session({
  secret: 'nodejsapplicationimplementingcalender',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Ensure this is 'true' if using HTTPS
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1/register', registerRouter);
app.use('/api/v1/login', loginRouter);
app.use('/api/v1/addtask', addtaskRouter);
app.use('/api/v1/gettasks', getTasksRouter);
app.use('/api/v1/changestatus', changeStatusRouter);
app.use('/api/v1/getPositions', getPositionsRouter);
app.use('/api/v1/deletetask', deleteTaskRouter);
app.use('/api/v1/updatetask', updatetaskRouter);
app.use('/api/v1/updatedetails', updateDetailsRouter);
app.use('/api/v1/comments', Comments);
app.use('/api/v1/notes', Notes);
app.use('/api/v1/invitation', Invitation);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




// const CLIENT_ID = '178896080956-cfr24oa7jk76b4isgvjuqmbsteec8pqf.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'http://localhost:5002/google/redirect'; // Ensure this matches Google Console settings

// const oauth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );


// app.get('/google', (req, res) => {
//   const scopes = ['https://www.googleapis.com/auth/calendar'];
//   const url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: scopes,
//   });
//   res.redirect( url );
// });


// // app.get('/', (req, res) => {
// //  res.send("Hello world")
// // });






const port = process.env.PORT || 5002;


// Ensure the server starts only once
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });



module.exports = app;
