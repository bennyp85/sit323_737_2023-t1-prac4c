const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

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

// JWT strategy configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret_key', // Replace with your secret key
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    if (jwtPayload) {
      return done(null, jwtPayload);
    } else {
      return done(null, false);
    }
  })
);

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  const payload = {
    id: user.id,
    username: user.username,
  };

  const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' });

  res.status(200).json({ token });
});



app.use(passport.initialize());

// Calculator endpoints
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

function performOperation(req, res, operation) {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);

  if (isNaN(num1) || isNaN(num2)) {
    res.status(400).json({ message: 'Invalid input parameters' });
    return;
  }

  const result = operation(num1, num2);
  res.status(200).json({ result });
}

const port = 3000;
app.listen(port, () => {
  console.log(`Calculator microservice is running on port ${port}`);
});
