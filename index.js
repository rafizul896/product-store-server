const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://product-store-80165.web.app',
        'https://product-store-80165.firebaseapp.com'
    ],
    credentials: true
}));

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.y7qmkns.mongodb.net/?retryWrites=true&w=majority&appName=cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const productsCollection = client.db('influencer-products').collection('products');

        app.get('/products', async (req, res) => {
            const search = req.query.search;
            const sortOption = req.query.sort;
            const category = req.query.category;
            const brandName = req.query.brandName;
            const size = parseInt(req.query.size);
            const page = parseInt(req.query.page);
            const minPrice = req.query.minPrice;
            const maxPrice = req.query.maxPrice;
            let query = {};
            // Filtering based on price range
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }
            if (search) {
                query.productName = { $regex: search, $options: 'i' }
            }
            if (category) {
                query.category = category
            }
            if (brandName) {
                query.brandName = brandName
            }
            let sort = {};
            if (sortOption === 'price-asc') {
                sort.price = 1;
            } else if (sortOption === 'price-desc') {
                sort.price = -1;
            } else if (sortOption === 'date-desc') {
                sort.creationDate = -1;
            }
            const skip = (page - 1) * size
            const result = await productsCollection.find(query).skip(skip).limit(size).sort(sort).toArray();
            res.send(result)
        })

        // // total products
        app.get('/products-total', async (req, res) => {
            const search = req.query.search;
            const category = req.query.category;
            const brandName = req.query.brandName;
            const minPrice = req.query.minPrice;
            const maxPrice = req.query.maxPrice;
            let query = {};
             // Filtering based on price range
             if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }
            if (search) {
                query.productName = { $regex: search, $options: 'i' }
            }
            if (category) {
                query.category = category
            }
            if (brandName) {
                query.brandName = brandName
            }
            const result = await productsCollection.countDocuments(query);
            res.send({ count: result })
        })

        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('PS Store server is running..!')
})

app.listen(port, () => {
    console.log(`PS Store server is running port on ${port}`)
})