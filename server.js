const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const cors = require('cors');

app.use(cors());

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
    res.send('Clean Campus API');
});

// Import route modules
const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alert');
const discussionRoutes = require('./routes/discussion');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/alert', alertRoutes);
app.use('/api/discussion', discussionRoutes);

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
}));

const users = [];
//👇🏻 generates a random string as ID
const generateID = () => Math.random().toString(36).substring(2, 10);

app.post("/api/register", async (req, res) => {
    const { email, password, username } = req.body;
    const id = generateID();
    //👇🏻 ensures there is no existing user with the same credentials
    const result = users.filter(
        (user) => user.email === email && user.password === password
    );
    //👇🏻 if true
    if (result.length === 0) {
        const newUser = { id, email, password, username };
        //👇🏻 adds the user to the database (array)
        users.push(newUser);
        //👇🏻 returns a success message
        return res.json({
            message: "Account created successfully!",
        });
    }
    //👇🏻 if there is an existing user
    res.json({
        error_message: "User already exists",
    });
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    //👇🏻 checks if the user exists
    let result = users.filter(
        (user) => user.email === email && user.password === password
    );
    //👇🏻 if the user doesn't exist
    if (result.length !== 1) {
        return res.json({
            error_message: "Incorrect credentials",
        });
    }
    //👇🏻 Returns the id if successfuly logged in
    res.json({
        message: "Login successfully",
        id: result[0].id,
    });
});

const threadList = [];

app.post("/api/create/thread", async (req, res) => {
    const { thread, userId, imageId } = req.body; // Accept imageId to associate with the thread
    const threadId = generateID();
  
    // Add the thread with image association
    threadList.unshift({
      id: threadId,
      title: thread,
      userId,
      imageId, // Store the image ID here
      replies: [],
      likes: [],
    });

    res.json({
        message: "Thread created successfully!",
        threads: threadList,
    });
});                                    

app.get("/api/all/threads", (req, res) => {
    res.json({
        threads: threadList,
    });
});

app.get("/api/threads/:imageId", (req, res) => {
    const { imageId } = req.params;
    
    // Filter threads related to the imageId
    const filteredThreads = threadList.filter(thread => thread.imageId === imageId);
  
    res.json({
      threads: filteredThreads,
    });
  });

app.post("/api/thread/like", (req, res) => {
    //👇🏻 accepts the post id and the user id
    const { threadId, userId } = req.body;
    //👇🏻 gets the reacted post
    const result = threadList.filter((thread) => thread.id === threadId);
    //👇🏻 gets the likes property
    const threadLikes = result[0].likes;
    //👇🏻 authenticates the reaction
    const authenticateReaction = threadLikes.filter((user) => user === userId);
    //👇🏻 adds the users to the likes array
    if (authenticateReaction.length === 0) {
        threadLikes.push(userId);
        return res.json({
            message: "You've reacted to the post!",
        });
    }
    //👇🏻 Returns an error user has reacted to the post earlier
    res.json({
        error_message: "You can only react once!",
    });
});

app.post("/api/thread/replies", (req, res) => {
    //👇🏻 The post ID
    const { id } = req.body;
    //👇🏻 searches for the post
    const result = threadList.filter((thread) => thread.id === id);
    //👇🏻 return the title and replies
    res.json({
        replies: result[0].replies,
        title: result[0].title,
    });
});

app.post("/api/create/reply", async (req, res) => {
    //👇🏻 accepts the post id, user id, and reply
    const { id, userId, reply } = req.body;
    //👇🏻 search for the exact post that was replied to
    const result = threadList.filter((thread) => thread.id === id);
    //👇🏻 search for the user via its id
    const user = users.filter((user) => user.id === userId);
    //👇🏻 saves the user name and reply
    result[0].replies.unshift({
        userId: user[0].id,
        name: user[0].username,
        text: reply,
    });

    res.json({
        message: "Response added successfully!",
    });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
