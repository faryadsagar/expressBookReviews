const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is unique
const isValid = (username) => {
    return !users.some(user => user.username === username);
}

// Authenticate username and password
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid login credentials" });
    }

    const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    req.session.token = token; // Store token in session

    res.status(200).json({ message: "Login successful", token });
});

// Middleware to authenticate based on access token
regd_users.use("/auth/*", (req, res, next) => {
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
});

// Add a book review (only accessible to authenticated users)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    if (!review) {
        return res.status(400).json({ message: "Review content required" });
    }

    // Assuming `books` is an object with ISBN keys
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Save the review to the book
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[req.user.username] = review;
    res.status(200).json({ message: "Review added successfully", book: books[isbn] });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
