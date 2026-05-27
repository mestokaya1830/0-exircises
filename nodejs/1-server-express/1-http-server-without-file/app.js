import express from "express";

const app = express();

// when you use fetch with 'Content-Type': 'application/json' you dont need to encode the body like this:
app.use(express.json());

// Middleware to parse URL-encoded data (from classic forms)
// because clasic form send this 'Content-Type': 'application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
    <head>
    <meta charset="UTF-8">
     <title>Home</title>
     <link rel="stylesheet" href="/main.css" />
    </head>
      <h1>http-server-without-file</h1>
      <img src="/logo.jpeg" alt="" />
      <form action="/api/user" method="POST">
        <input type="text" name="name" placeholder="Enter some data" />
        <input type="text" name="age" placeholder="Enter user age" />
        <button type="submit">Send</button>
      </form>
    `);
});

app.post("/api/user", (req, res) => {
  // res.send({ user: { name: req.body.name, age: req.body.age } });
  res.send(`
    <head>
    <meta charset="UTF-8">
     <title>User</title>
     <link rel="stylesheet" href="/main.css" />
    </head>
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
