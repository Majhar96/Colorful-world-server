const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y1i3r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);


async function run() {
    try {
        await client.connect();
        const database = client.db('sunglassDb');
        const productsCollection = database.collection('products')


        // Get API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })


        // Get single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })


        // post API
        app.post('/products', async (req, res) => {

            const product = req.body;
            console.log('hit the api', product);

            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result)

        })

        // delete Api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('hello colorful world!!')
})

app.listen(port, () => {
    console.log(`Listening :${port}`)
})