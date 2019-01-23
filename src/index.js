const { GraphQLServer } = require('graphql-yoga')
import * as session from "express-session"
const dotenv = require('dotenv')

const { prisma } = require('./generated/prisma-client')
const { resolvers } = require('./resolvers')
const { permissions } = require('./permissions')


/* ----------------------------------------
Load environment variables from .env
---------------------------------------- */
dotenv.config()
const SESSION_SECRET = process.env.SESSION_SECRET


/* ----------------------------------------
Create GraphQL Server
---------------------------------------- */
const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  middlewares: [permissions],
  context: request => {
    return {
      ...request,
      prisma,
    }
  },
})


/* ----------------------------------------
Use Express Session
---------------------------------------- */
server.express.use(
  session({
    name: "uid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
)


/* ----------------------------------------
Use CORS
---------------------------------------- */
const cors = {
  credentials: true,
  origin: "http://localhost:3000"
}


/* ----------------------------------------
Start the server
---------------------------------------- */
server.start({ cors }, () => console.log('Server is running on http://localhost:4000'))
