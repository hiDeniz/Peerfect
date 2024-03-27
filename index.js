const express = require('express')
const app = express()
const port = 3000
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

dotenv.config();
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Database connected!'))
    .catch((err) => {console.log(err)});

app.use(express.json());
app.use("/api/", authRoute);
app.use("/api/users", userRoute);
app.listen(process.env.PORT || port, () => console.log(`Peerfect listening on port ${process.env.PORT}!`))