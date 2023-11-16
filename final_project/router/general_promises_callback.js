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
function getBooks(){
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    });
}

public_users.get('/', (req, res) => {
    getBooks().then(books => {
        res.status(200).json({ books: books});
    }).catch(error => {
        res.status(500).json({ message: "Error fetching books", error: error});
    });
});

// Get book details based on ISBN
function getISBN(){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    });
}
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    getISBN().then(book => {
        res.status(200).json({book:book[isbn]})
  }).catch(error => {
        res.status(500).json({ message: "Error fetching books",})
  })
 });
  
// Get book details based on author
function getAuthor(author){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let filteredBooks = [];
            for (let key in books) {
                if (books.hasOwnProperty(key) && books[key].author === author) {
                  filteredBooks.push(books[key]);
                }
            }
            resolve(filteredBooks);
        }, 1000); // Simulating delay
    });
}

public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  getAuthor(author).then(foundBooks => {
    if (foundBooks.length === 0){
        res.status(404).json(`No books by ${author}`);
    } else {
        res.status(200).json({booksByAuthor: foundBooks });
    }
  }).catch(error => {
    res.status(500).json({ message: "Error fetching books", error: error});
  });
});

// Get all books based on title
function getTitle(title){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let filteredBooks = [];
            for (let key in books) {
                if (books.hasOwnProperty(key) && books[key].title === title) {
                  filteredBooks.push(books[key]);
                }
            }
            resolve(filteredBooks);
        }, 1000); // Simulating delay
    });
}

public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  getTitle(title).then(foundBooks => {
    if (foundBooks.length === 0) {
        res.status(404).json(`No books titled ${title}`);
    } else {
        res.status(200).json({booksByTitle: foundBooks });
    }
  }).catch(error => {
    res.status(500).json({ message: "Error fetching books", error: error});
  });
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
