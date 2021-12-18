const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");

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

    //variable to store token
    let m;

    //middlewire to check authentication
    function authenticateToken(req, res, next) {
      //spliting brarer and token
      // const authHeader = req.headers['authorization'];
      const token = m && m.split(" ")[1];
      //if token null it will give unauthorized status
      if (token == null) return res.sendStatus(401);

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        console.log(req.user);
        next();
      });
    }

    //get to check admin or not

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      cpnsole.log(req.user.email);
      if (req.user.email === email) {
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        // console.log(user, isAdmin);
        res.json({ admin: isAdmin });
      } else {
        res.sendStatus(401).json({ message: "you are not permitted" });
      }
    });

    //deleteing user
    app.delete("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.deleteOne(query);
      console.log(user);
      //   res.json();
    });

    //for authentication
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      m = "Bearer " + accessToken;
      res.json({ accessToken: m });
    });

    //getting all users
    app.get("/users", async (req, res) => {
      const query = {};
      const user = usersCollection.find(query);
      const result = await user.toArray();
      res.json(result);
    });

    //getting single users
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.json(user);
    });

    //adding user
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //updating user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const options = { upsert: true };
      const filter = { email: user.email };
      const query = { $set: { phone: user.phone, address: user.address } };
      console.log(user);
      const result = await usersCollection.updateOne(filter, query, options);
      res.json(result);
    });

    //updating user
    app.put("/users/:email", async (req, res) => {
      const user = req.body;
      const options = { upsert: true };
      const filter = { email: user.email };
      const query = { $set: { name: user.name } };
      console.log(user);
      const result = await usersCollection.updateOne(filter, query, options);
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

    //delete package
    app.delete("/package/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(id);
      const result = await packagesCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });

    //update package
    app.put("/package/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const doc = {
        $set: {
          title: data.title,
          notes: data.notes,
          price: data.price,
          img: data.img,
        },
      };
      console.log(doc);
      const result = await packagesCollection.updateOne(query, doc, options);
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

//testing requests
app.get("/", (req, res) => {
  res.send("todo server running....");
});

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
