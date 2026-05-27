import express from "express";
import path from "path";
const app = express();


// when you use fetch with 'Content-Type': 'application/json'
// you dont need to encode the body like this: app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Middleware to parse URL-encoded data (from classic forms) 
// because clasic form send this 'Content-Type': 'application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});


// You cannot send thise data direkt into a html file
// for this goal you need to use template engine like ejs, pug, handlebars etc.
// or js fetch api to send data to the client and render it in the client side
app.post("/api/user", (req, res) => {
  // res.send({ user: { name: req.body.name, age: req.body.age } });
  res.send(`
      <h1>User Created</h1>
      <p>Name: ${req.body.name}</p>
      <p>Age: ${req.body.age}</p>

      <a href="/">Go Back</a>
    `);
});



app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
