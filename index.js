const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ftrdn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("connected to db");

    //database name
    const database = client.db("TODO");
    //database coolections name
    const appointmentsCollection = database.collection("appointments");
    const usersCollection = database.collection("users");
    const notesCollection = database.collection("notes");
    const packagesCollection = database.collection("packages");
    const subscriptionCollection = database.collection("subscription");

    //get to check admin or not

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      // console.log(user, isAdmin);
      res.json({ admin: isAdmin });
    });

    //deleteing user
    app.delete("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.deleteOne(query);
      console.log(user);
    //   res.json();
    });

    //getting all users
    app.get("/users", async (req, res) => {
      const query = {};
      const user = usersCollection.find(query);
      const result = await user.toArray();
      res.json(result);
    });

    //adding user
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //adding subscription
    app.post("/subscription", async (req, res) => {
      const pack = req.body;
      const result = await subscriptionCollection.insertOne(pack);
      res.json(result);
    });

    //reading subscription filtered by mail

    app.get("/subscription/:email", async (req, res) => {
      const email = { email: req.params.email };
      console.log(email);
      const result = subscriptionCollection.find(email);
      const allResult = await result.toArray();
      res.json(allResult);
    });

    //for adding notes to database
    app.post("/notes", async (req, res) => {
      const notes = req.body;
      console.log(notes);
      const result = await notesCollection.insertOne(notes);
      console.log(result);
      res.json(result);
    });

    //adding package to database
    app.post("/package", async (req, res) => {
      const notes = req.body;
      console.log(notes);
      const result = await packagesCollection.insertOne(notes);
      console.log(result);
      res.json(result);
    });

    //read all packages
    app.get("/package", async (req, res) => {
      const packs = {};
      const result = packagesCollection.find(packs);
      const allResult = await result.toArray();
      console.log(allResult);
      res.json(allResult);
    });

    //get single package
    app.get("/package/:id", async (req, res) => {
      const id = req.params.id;
      const result = await packagesCollection.findOne(ObjectId(id));
      console.log(result);
      res.json(result);
    });

    //redaing notes from databe
    app.get("/notes/:id", async (req, res) => {
      const id = req.params.id;
      const data = { email: id };
      console.log(id);
      const result = notesCollection.find(data);
      const allResult = await result.toArray();
      res.json(allResult);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("todo server running....");
});

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
