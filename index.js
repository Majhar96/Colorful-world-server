const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y1i3r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);
async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}


async function run() {
    try {
        await client.connect();
        const database = client.db('sunglassDb');
        const productsCollection = database.collection('products');
        const customerCollection = database.collection('customer');
        const customerReview = database.collection('reviews');
        const usersCollection = database.collection('users');


        // Get API
        app.get('/products', verifyToken, async (req, res) => {
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


        // customer data save in server

        app.get('/customer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await customerCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/customer', async (req, res) => {
            const customer = req.body;
            const result = await customerCollection.insertOne(customer);
            console.log(result);
            res.json(result);
        });

        app.post('/reviews', async (req, res) => {
            const userReview = req.body;
            const result = await customerReview.insertOne(userReview);
            console.log(result);
            res.json(result);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await customerReview.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

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