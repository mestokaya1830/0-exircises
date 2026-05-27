import express from 'express'
import serveIndex from 'serve-index'
import basicAuth from 'express-basic-auth'
import multer from 'multer'
import path from 'path'

const app = express()

// ----------------------------
// Users for login
// ----------------------------
 const users = { 'admin': '121212', 'admin2': '121212' }
app.use('/ftp', basicAuth({ users, challenge: true }))

// ----------------------------
// Upload setup
// ----------------------------
const uploadFolder = path.join('public', 'ftp')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage })

// Upload POST single file
// app.post('/ftp/upload', upload.single('files'), (req, res) => {
//   res.redirect('/ftp') // redirect back to FTP list
// })

// Multiple files upload
app.post('/ftp/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.send('No files were uploaded.')
  }
  console.log('Uploaded files:', req.files.map(f => f.originalname))
  res.redirect('/ftp')
})

// ----------------------------
// Upload form page
// ----------------------------
app.get('/ftp/upload-form', (req, res) => {
  res.send(`
    <h1>Upload File</h1>
    <form action="/ftp/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="files" multiple required /><br/><br/>
      <button type="submit">Upload</button>
    </form>
    <br/>
    <a href="/ftp">Back to File List</a>
  `)
})

// ----------------------------
// Serve static files and FTP-style list
// ----------------------------
app.use('/ftp', express.static(uploadFolder))
app.use('/ftp', serveIndex(uploadFolder, { icons: true }))

// ----------------------------
app.listen(3000, () => console.log('Server running on http://localhost:3000/ftp'))
