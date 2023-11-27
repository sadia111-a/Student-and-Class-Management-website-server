const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t3yv0bn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db("studentDb").collection("users");
    const teacherCollection = client.db("studentDb").collection("teachers");
    const courseCollection = client.db("studentDb").collection("course");
    const enrollCollection = client.db("studentDb").collection("enroll");

    // user related api
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      // insert email if user doesn't exist
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // send database teacher data
    app.get("/teachers", async (req, res) => {
      const result = await teacherCollection.find().toArray();
      res.send(result);
    });
    app.post("/teachers", async (req, res) => {
      const teacherReq = req.body;
      const result = await teacherCollection.insertOne(teacherReq);
      res.send(result);
    });

    app.get("/course", async (req, res) => {
      const result = await courseCollection.find().toArray();
      res.send(result);
    });

    // enroll collection
    app.get("/enroll", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await enrollCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/enroll", async (req, res) => {
      const enrollCourse = req.body;
      const result = await enrollCollection.insertOne(enrollCourse);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Student learning classroom");
});

app.listen(port, () => {
  console.log(`student classroom is on port ${port}`);
});
