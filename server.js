const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Task = require('./models/task'); 

const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const authController = require('./controllers/auth.js');
const tasksController = require('./controllers/task.js');

const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


app.use('/tasks', tasksController);


app.get('/', async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.render('index.ejs', {
      user: null,
      tasks: [] 
    });
  }

  try {
    const foundTasks = await Task.find({ user: req.session.user._id });
    
    res.render('index.ejs', {
      tasks: foundTasks || [],  
      user: req.session.user,
    });
  } catch (err) {
    console.log('Error fetching tasks:', err);
    res.send('An error occurred while loading your tasks.');
  }
});


app.use('/auth', authController);
app.use('/tasks', tasksController);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
