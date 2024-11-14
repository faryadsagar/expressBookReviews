const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User registered successfully." });
    } else {
      return res.status(400).json({ message: "Username already exists." });
    }
  }
  return res.status(400).json({ message: "Username and password are required." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.author === author);
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author." });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.title === title);
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title." });
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book." });
  }
});

// Function to get book details by title using Promise
function getBooksByTitleWithPromise(title) {
  return axios.get(`http://localhost:3000/title/${title}`) // Replace with your actual URL
    .then(response => {
      console.log(`Books titled "${title}" fetched successfully with Promises:`, response.data);
      return response.data;
    })
    .catch(error => {
      console.error("Error fetching books by title:", error);
      throw error;
    });
}

// Function to get book details by title using async-await
async function getBooksByTitleAsync(title) {
  try {
    const response = await axios.get(`http://localhost:3000/title/${title}`); // Replace with your actual URL
    console.log(`Books titled "${title}" fetched successfully with async-await:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by title with async-await:", error);
    throw error;
  }
}

// Example usage of both methods for title search
const title = 'One Thousand and One Nights'; // Replace with the title you want to search for

getBooksByTitleWithPromise(title)
  .then(books => console.log("Books fetched using Promises by title:", books))
  .catch(err => console.error("Failed to fetch books with Promises by title:", err));

(async () => {
  try {
    const books = await getBooksByTitleAsync(title);
    console.log("Books fetched using async-await by title:", books);
  } catch (err) {
    console.error("Failed to fetch books with async-await by title:", err);
  }
})();

module.exports.general = public_users;
