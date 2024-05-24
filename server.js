const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/collegeHelper';
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to handle login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    res.redirect('/dashboard');
  } else {
    res.send('Invalid username or password');
  }
});

// Route for the dashboard (after login)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Route to handle root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Routes for handling file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log('No file received');
    return res.status(400).send('No file received');
  }
  console.log('File received:', req.file);
  res.redirect('/dashboard');
});

app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ err: 'Error fetching files' });
    }
    if (!files || files.length === 0) {
      return res.status(404).json({ err: 'No files exist' });
    }
    return res.json(files);
  });
});

app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ err: 'Error fetching file' });
    }
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }
    return res.json(file);
  });
});

app.get('/file/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ err: 'Error fetching file' });
    }
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }
    if (file.contentType === 'application/pdf') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: 'Not a PDF' });
    }
  });
});

// Route to delete a file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: mongoose.Types.ObjectId(req.params.id), root: 'uploads' }, (err) => {
    if (err) {
      console.error(err);
      return res.status(404).json({ err: 'Error deleting file' });
    }
    res.redirect('/dashboard');
  });
});

// Route to update a file
app.post('/update/:id', upload.single('file'), (req, res) => {
  gfs.remove({ _id: mongoose.Types.ObjectId(req.params.id), root: 'uploads' }, (err) => {
    if (err) {
      console.error(err);
      return res.status(404).json({ err: 'Error updating file' });
    }
    res.redirect('/dashboard');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
