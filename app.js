const express = require('express');
const userRouter = require('./routers/user');
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(userRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});