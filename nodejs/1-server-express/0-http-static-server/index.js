import dotenv from 'dotenv'
dotenv.config()
import express from 'express';

const app = express();

// Static webserver without any additional routes or middleware, just serving files from the 'static' directory. 
// This is useful for hosting a frontend application or serving assets like images, CSS, and JavaScript files.

// Static folder
app.use(express.static('static'));


// buy a server and create app folder, then run this file with node app.js to start the server.
// to use 3000 port open this port to the internet and give permission in firewall.
// open browser type www/yourmaschineip:3000 to see the static files being served from the 'static' directory.
// if you want to use standart port 80 call only www/yourmaschineip without port number, but make sure to run the server with appropriate permissions to bind to port 80 (usually requires root privileges on Unix systems).
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Static server is running on port ${PORT}`);
});
