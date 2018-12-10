const express = require('express')
const router = express.Router()
const expressValidator = require('express-validator')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
const passport = require('passport')

router.use(expressValidator())
router.use(flash())

// Bring in User Model
let User = require('../models/user')

// Register From
router.get('/register', function (req, res) {
  res.render('register')
})

// Register Process
router.post('/register', function (req, res) {
  const username = req.body.username
  const password = req.body.password
  const password2 = req.body.password2

  req.checkBody('username', 'Username is required').notEmpty()
  req.checkBody('password', 'Password is required').notEmpty()
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password)

  let errors = req.validationErrors()

  if (errors) {
    res.render('register', {
      errors: errors
    })
  } else {
    User.findOne({
      username: {
        '$regex': '^' + username + '\\b', '$options': 'i'
      }
    }, function (err, user) {
      if (err) throw err
      if (user) {
        res.render('register', {
          user: user
        })
      } else {
        let newUser = new User({
          username: username,
          password: password
        })

        bcrypt.genSalt(10, function (err, salt) {
          if (err) {
            console.log(err)
          }
          bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) {
              console.log(err)
            }
            newUser.password = hash
            newUser.save(function (err) {
              if (err) {
                console.log(err)
              } else {
                req.flash('success', 'You are now registered and can log in')
                res.redirect('/')
              }
            })
          })
        })
      }
    })
  }
})

// Login Form
router.get('/login', function (req, res) {
  res.render('login')
})

// Login Process
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next)
})

// Logout
router.get('/logout', function (req, res) {
  req.logout()
  req.flash('success', 'You are logged out')
  res.redirect('/')
})

module.exports = router
