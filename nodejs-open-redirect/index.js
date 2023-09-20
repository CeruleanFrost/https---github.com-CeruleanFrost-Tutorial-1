// Importing necessary modules
const express = require("express"); // Express.js for web application framework
const session = require("express-session"); // For handling session state
const bodyParser = require("body-parser"); // For parsing incoming request bodies
const app = express(); // Creating an instance of Express
const port = 3000; // Defining the port number on which the server will listen
const mysql = require("mysql"); // MySQL driver for Node.js

// Establishing connection with MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodelogin",
});

// Connecting to the MySQL server
connection.connect((err) => {
  if (err) throw err; // If there is an error in connection, throw the error
  console.log("Connected to the MySQL server."); // If connected successfully, log the message
});

// Setting up express application
app.set("view engine", "pug"); // Setting pug as the template engine
app.use(bodyParser.urlencoded({ extended: true })); // Parsing urlencoded request bodies
app.use(session({ secret: "super-secret" })); // Setting up session middleware with a secret key

// Define route for login page
app.get("/login", (req, res) => {
  if (req.session.isLoggedIn === true) {
    // If the user is already logged in
    return res.redirect("/"); // Redirect to home page
  }
  res.render("login", { error: false }); // If not logged in, render the login page with no error
});

// Handle form submission on login page
app.post("/login", (req, res) => {
  const { username, password } = req.body; // Get username and password from request body
  const sql = "SELECT * FROM accounts WHERE username = ? AND password = ?"; // SQL query to get the user from the database

  // Execute the SQL query
  connection.query(sql, [username, password], (error, results) => {
    if (error) throw error; // If there is an error, throw it

    // If a matching user is found in the database
    if (results.length > 0) {
      req.session.isLoggedIn = true; // Set session variable to denote user is logged in
      req.session.username = username; // Store the logged in user's username in the session
      // If a redirect URL is provided in the query parameters, redirect to that URL
      // Otherwise, redirect to the home page
      res.redirect(req.query.redirect_url ? req.query.redirect_url : "/");
    } else {
      // If no matching user is found, render the login page with an error message
      res.render("login", { error: "Username or password is incorrect" });
    }
  });
});

// Route for logout. Clears session information.
app.get("/logout", (req, res) => {
  req.session.isLoggedIn = false; // Clear the session variable denoting the user is logged in
  res.redirect("/"); // Redirect to home page
});

// Define home page route
app.get("/", (req, res) => {
  // Render the home page, passing a variable to denote whether the user is logged in
  res.render("index", { isLoggedIn: req.session.isLoggedIn });
});

// Define route for balance page
app.get("/balance", (req, res) => {
  if (req.session.isLoggedIn === true) {
    // If the user is logged in
    res.send("Your account balance is $1234.52"); // Send the user's balance
  } else {
    // If the user is not logged in, redirect to login page and provide the current URL as the redirect URL
    res.redirect("/login?redirect_url=/balance");
  }
});

// Define route for account number page
app.get("/account", (req, res) => {
  if (req.session.isLoggedIn === true) {
    // If the user is logged in
    res.send("Your account number is ACL9D42294"); // Send the user's account number
  } else {
    // If the user is not logged in, redirect to login page and provide the current URL as the redirect URL
    res.redirect("/login?redirect_url=/account");
  }
});

// Define route for contact us page
app.get("/contact", (req, res) => {
  res.send("Our address : 321 Main Street, Beverly Hills."); // Send the contact information
});

// Start the server on the given port
app.listen(port, () => {
  console.log(`MyBank app listening at http://localhost:${port}`); // Log that the server is listening
});

// Route for user details page
app.get("/user-details", (req, res) => {
  if (req.session.isLoggedIn === true) {
    // If the user is logged in
    const username = req.session.username; // Get the username from the session
    const sql = "SELECT * FROM accounts WHERE username = ?"; // SQL query to get user details

    // Execute the SQL query
    connection.query(sql, [username], (error, results) => {
      if (error) throw error; // If there is an error, throw it

      if (results.length > 0) {
        // If the user is found in the database
        const user = results[0]; // Get the user
        res.render("user-details", { user }); // Render the user details page with the user data
      } else {
        res.send("No user details found."); // If no user is found, send an error message
      }
    });
  } else {
    // If the user is not logged in, redirect to login page and provide the current URL as the redirect URL
    res.redirect("/login?redirect_url=/user-details");
  }
});

// Route for update email page
app.get("/update-email", (req, res) => {
  if (req.session.isLoggedIn === true) {
    // If the user is logged in
    const username = req.session.username; // Get the username from the session
    const sql = "SELECT * FROM accounts WHERE username = ?"; // SQL query to get user details

    // Execute the SQL query
    connection.query(sql, [username], (error, results) => {
      if (error) throw error; // If there is an error, throw it

      if (results.length > 0) {
        // If the user is found in the database
        const user = results[0]; // Get the user
        res.render("update-email", { user }); // Render the update email page with the user data
      } else {
        res.send("No user details found."); // If no user is found, send an error message
      }
    });
  } else {
    // If the user is not logged in, redirect to login page and provide the current URL as the redirect URL
    res.redirect("/login?redirect_url=/update-email");
  }
});

// Route to handle form submission on update email page
app.post("/update-email", (req, res) => {
  if (req.session.isLoggedIn !== true) {
    // If the user is not logged in
    return res.redirect("/login"); // Redirect to the login page
  }
  const { email } = req.body; // Get the new email from the request body
  const sql = "UPDATE accounts SET email = ? WHERE username = ?"; // SQL query to update the user's email

  // Execute the SQL query
  connection.query(sql, [email, req.session.username], (error) => {
    if (error) throw error; // If there is an error, throw it
    res.redirect("/user-details"); // Redirect to the user details page
  });
});
