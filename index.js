const app = require('express')();
const PORT = 8080;

app.listen(
    PORT,
    () => console.log(`its alive uwu on ${PORT}`)
);

app.get('/tshirt', (req, res) => {
    res.status(200).send({
        tshirt: "this tshirt",
        size: "large"
    })
});