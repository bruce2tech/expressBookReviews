const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const { v4: uuidv4 } = require('uuid'); //Import UUID generator

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  console.log(`Authenticating user: ${username} with password: ${password}`);
  console.log('Users array:', users);
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });

  console.log('Valid users found:', validusers)

  return validusers.length > 0;
  /*if (validusers.length > 0){
    return true;
  } else {
    return false;
  }*/
} 

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60 * 60});

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const bookReview = req.body.review;
  const username = req.session.authorization.username;

  if (!bookReview){
    return res.status(400).json({message: "No review provided"});
  }

  if (!username) {
    return res.status(403).json({ message: "User not logged in"});
  }

  if (books.hasOwnProperty(isbn)) {
    //Ensure reviews is initialized as an array
    if (!Array.isArray(books[isbn].reviews)) {
      books[isbn].reviews = [];
    }

    let existingReviewIndex = books[isbn].reviews.findIndex(review => review.username === username);

    if (existingReviewIndex !== -1) {
      //Modify existing review
      books[isbn].reviews[existingReviewIndex].review = bookReview;
    } else {
      //Add new review with a UUID
      books[isbn].reviews.push({
        id: uuidv4(),
        username: username,
        review: bookReview
      });
    }
    
    res.status(200).json({message: "Review updated successfully", reviews: books[isbn].reviews});
  } else {
    res.status(404).json({message: "Book not found"});
  } 
});

regd_users.delete("/auth/review/:isbn/:reviewId", (req, res) => {
  const isbn = req.params.isbn;
  const reviewId = req.params.reviewId;
  const username = req.session.authorization.username;

  if (books.hasOwnProperty(isbn)) {
    const reviewIndex = books[isbn].reviews.findIndex(review => review.id === reviewId && review.username === username);

    if (reviewIndex === -1) {
      return res.status(404).json({message: "Review not found or user not authorized to delete this review"});
    }

    books[isbn].reviews.splice(reviewIndex, 1);
    res.status(200).json({message: "Review deleted successfully"});
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
