const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({ message: "Hello from your new microservice :D" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});