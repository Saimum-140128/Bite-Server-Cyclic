require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jv8sqpa.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
  //  await client.connect();

    const userCollection = client.db('Bite').collection('users');
    const foodCollection = client.db('Bite').collection('foods');
    const orderCollection = client.db('Bite').collection('orders');

    // order related api
    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      console.log(newOrder);
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
  })

  app.get('/orders', async (req, res) => {

      let queryObj = {};

      const email = req.query.orderemail;

      if(email){
        queryObj.orderemail = email;
      }

      console.log(queryObj);
      
      const cursor = orderCollection.find(queryObj);
      const result = await cursor.toArray();
      res.send(result);
  })

  app.delete('/orders/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await orderCollection.deleteOne(query);
    res.send(result);
  })

    // user related api
    app.post('/users', async (req, res) => {
        const newUser = req.body;
        console.log(newUser);
        const result = await userCollection.insertOne(newUser);
        res.send(result);
    })

    app.get('/itemCount', async (req, res) => {
      const count = await foodCollection.estimatedDocumentCount();
      res.send({ count });
    })

    // food related api
    app.post('/foods', async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
  })

  app.get('/foods', async (req, res) => {

    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

  //  console.log('pagination query', page, size);

    if(size){
      
      const result = await foodCollection.find()
      .skip(page * size)
      .limit(size)
      .toArray();
      res.send(result);
    }
    else{
      let queryObj = {};
      let sortObj = {};

      const email = req.query.email;
      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder;

      if(email){
        queryObj.email = email;
      }

      if(sortField && sortOrder){
        sortObj[sortField] = sortOrder;
      }

    // console.log(sortObj[sortField]);
      
      const cursor = foodCollection.find(queryObj).sort(sortObj);
      const result = await cursor.toArray();
      res.send(result);
      }
  })

  app.get("/foods/:id", async (req, res) => {
    const id = req.params.id;
    console.log("id", id);
    const query = {
      _id: new ObjectId(id),
    };
    const result = await foodCollection.findOne(query);
    console.log(result);
    res.send(result);
  });

  app.put("/foods/:id", async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    const filter = {
      _id: new ObjectId(id),
    };
    const options = { upsert: true };
    const updatedData = {
      $set: {
        name: data.name,
        image: data.image,
        origin: data.origin,
        price: data.price,
        email: data.email,
        quantity: data.quantity,
        description: data.description,
        count: data.count,
      },
    };
    const result = await foodCollection.updateOne(
      filter,
      updatedData,
      options
    );
    res.send(result);
  });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Bite server is running')
})

app.listen(port, () => {
    console.log(`Bite Server is running on port: ${port}`)
})