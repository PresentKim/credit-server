const express = require('express');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const userRouter = require('./routers/user');
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(userRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});