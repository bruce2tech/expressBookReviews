const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({"username":username, "password":password});
      return res.status(200).json({message: "User successfully registered. Now you login"});
    } else {
      return res.status(404).json({message: "User already exists!"})
    }
  } else {
    return res.status(404).json({message: "must enter username & password"})
  }
  return res.status(200).json({message: "Unable to register user"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify({books},4));
  return res.status(200).json({message: "book list"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  res.send(book);
  return res.status(200).json({message: "book isbn"});
 });
  
// Get book details based on author 
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];
  for (let key in books) {
    if (books.hasOwnProperty(key) && books[key].author === author){
      booksByAuthor.push(books[key]);
    }
  }
  if (booksByAuthor.length === 0){
    res.send(`No books by ${author}`);
  } else {
    res.send(JSON.stringify({booksByAuthor},4));
  }
  return res.status(200).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];
  for (let key in books){
    if (books.hasOwnProperty(key) && books[key].title === title){
      booksByTitle.push(books[key]);
    }
  }
  if (booksByTitle.length === 0){
    res.send(`No books titled ${title}`)
  } else {
    res.send(JSON.stringify({booksByTitle},4));
  }
  return res.status(200).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  let bookReview;

  if (books.hasOwnProperty(isbn) && books[isbn].reviews) {
    bookReview = books[isbn].reviews;
    res.status(200).json(bookReview);
  } else {
    res.status(404).json({ message: `No reviews found for ISBN ${isbn}` });
  }
});

module.exports.general = public_users;
