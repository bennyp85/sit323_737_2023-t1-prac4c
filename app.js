// Import required modules
const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Initialize express application
const app = express();
app.use(express.static('public')); // Serve static files from 'public' folder
app.use(bodyParser.json()); // Parse JSON request bodies

// Mock user data for demonstration purposes
const users = [
  {
    id: 1,
    username: 'user1',
    password: 'password1'
  },
  {
    id: 2,
    username: 'user2',
    password: 'password2'
  }
];

// Configure JWT strategy for authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret_key', // Replace with your secret key
};

// Initialize and use JWT strategy for passport
passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    if (jwtPayload) {
      return done(null, jwtPayload);
    } else {
      return done(null, false);
    }
  })
);

// Endpoint for user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find the user in the users array
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  // If user not found, return an error
  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  // Create payload and sign JWT
  const payload = {
    id: user.id,
    username: user.username,
  };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' });

  // Respond with JWT token
  res.status(200).json({ token });
});

app.use(passport.initialize());

// Calculator endpoints with JWT authentication
app.get('/add', passport.authenticate('jwt', { session: false }), (req, res) => {
  performOperation(req, res, (num1, num2) => num1 + num2);
});

app.get('/subtract', passport.authenticate('jwt', { session: false }), (req, res) => {
  performOperation(req, res, (num1, num2) => num1 - num2);
});

app.get('/multiply', passport.authenticate('jwt', { session: false }), (req, res) => {
  performOperation(req, res, (num1, num2) => num1 * num2);
});

app.get('/divide', passport.authenticate('jwt', { session: false }), (req, res) => {
  performOperation(req, res, (num1, num2) => num1 / num2);
});

// Function to perform mathematical operations and send the result
function performOperation(req, res, operation) {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);

  // Validate input parameters
  if (isNaN(num1) || isNaN(num2)) {
    res.status(400).json({ message: 'Invalid input parameters' });
    return;
  }

  // Perform the operation and send the result
  const result = operation(num1, num2);
  res.status(200).json({ result });
}

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Calculator microservice is running on port ${port}`);
});
