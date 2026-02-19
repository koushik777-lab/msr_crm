const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config();

function connectToDb() {
  const uri = process.env.MONGO_URI;

  return mongoose.connect(uri);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function genrateJwtToken(obj) {
  const JWT = jwt.sign( obj , process.env.JWT_SECRET);
  // console.log(JWT);
  return JWT;
}

function validateJwtToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
    connectToDb,
    hashPassword,
    comparePassword,
    genrateJwtToken,
    validateJwtToken,
    getRandomResponse,
  };








function getRandomResponse() {
  const funnySentences = [
    "Loading... just kidding, it’s broken.",
    "Error 418: I’m a teapot. Don’t ask.",
    "Your request is very important to us... but not right now.",
    "404: Motivation not found – try again later.",
    "Server is on a coffee break, come back in 10.",
    "Request received. Processing… jk, I’m napping.",
    "Why so many requests? Are you okay?",
    "503: Service Unavailable – probably watching cat videos.",
    "Your request was denied – but in a friendly way :)",
    "We saw your request, we ignored it, we moved on.",
    "Request accepted. Server panicked and forgot what to do.",
    "Processing... estimated time: 2-3 business eternities.",
    "Congratulations! You found a rare error. We have no idea what it means.",
    "Response delayed due to excessive scrolling on social media.",
    "Request timed out... because we were debating pizza toppings.",
    "Server needs therapy after your request.",
    "We saw your request and we felt it... emotionally.",
    "200 OK – but are you really okay?",
    "Request approved… but at what cost?",
    "Error: Server ran out of jokes. Try again later.",
    "Your request has been placed in a queue… behind 7 billion others. Good luck.",
    "Error 404: Server ran away. We’re looking for it.",
    "Request received... we think. Might’ve been a dream.",
    "Server is thinking... and it’s not going well.",
    "Response loading… buffering… existential crisis detected.",
    "Server is busy right now – probably gossiping with the database.",
    "HTTP 200 – But emotionally, I’m 404.",
    "Request accepted – Server immediately regretted it.",
    "503: Server is on strike. Demands more RAM and snacks.",
    "I saw your request. I laughed. I ignored it.",
    "Server overheated – It read your request and blushed.",
    "Error 202: Request accepted... but we’re not doing it.",
    "Request sent into the void. Awaiting response from the universe.",
    "409 Conflict: Server vs. Monday – Monday is winning.",
    "418: Server is now a coffee machine. Your move.",
    "Connection established... but trust? That’s another story.",
    "Server received your request and whispered 'Not today.'",
    "Request processed... emotionally. Nothing else happened.",
    "Server tried, server cried, server died.",
    "200 OK – But internally? 500 Internal Screaming Error.",
    "Your request made the server Google 'career change options'.",
    "503: Backend taking a nap – frontend is just pretending.",
    "Server liked your request but won’t reply. Playing hard to get.",
    "Request received. Response in 3-5 business centuries.",
    "Server needs coffee before it can deal with you.",
    "Error 700: Too much enthusiasm detected. Calm down.",
    "Server is buffering... just like your life choices.",
    "Response delayed – server fell into a Netflix binge.",
    "HTTP 200: Request succeeded – server still hates Mondays.",
  ];
  const length = funnySentences.length;
  const randomIndex = Math.floor(Math.random() * length);
  return funnySentences[randomIndex];
}


