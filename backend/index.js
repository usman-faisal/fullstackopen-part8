const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const {v1: uuid} = require("uuid")
const Author = require("./models/author")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const Book = require("./models/book")
const User = require("./models/user")
const mongoose = require("mongoose");
const {GraphQLError} = require("graphql/error");
mongoose.set("strictQuery",false);
mongoose.connect("mongodb+srv://usman:123@cluster0.hkd7kos.mongodb.net/library?retryWrites=true&w=majority")
    .then(() => {
        console.log("connected to mongodb");
    })
    .catch(() => {
        console.log("could not connect to mongodb")
    })


const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  
  type Book {
    title: String!
    published: String!
    author: Author!
    id: ID!
    genres: [String!]!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
    allUsers: [User!]!
  }
  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
    ):Author
    createUser(
        username: String!
        favoriteGenre: String!
    ): User
    login(
        username: String!
        password: String!
    ): Token
  }
`

const resolvers = {
    Query: {
        bookCount: async() => Book.collection.countDocuments(),
        authorCount: () =>  Author.collection.countDocuments(),
        allBooks: async(root,args) => {
            if(!args.author && !args.genre) return Book.find({}).populate("author");
            if(args.author && !args.genre)
                return Book.find({}).populate("author").find({
                    'author.name': args.author
                })
            if(!args.author && args.genre)
                return Book.find({
                    genres: args.genre
                }).populate("author")
            if(args.author && args.genre)
                return Book.find({}).populate("author").find({
                    "author.name": args.author,
                    genres: args.genre
                })
        },
        allAuthors: async() =>  Author.find({}),
        allUsers: async() => User.find({}),
        me: (root,args,context) => context.currentUser
    },
    Author: {
        async bookCount(root) {
            return Book.countDocuments({ author: root._id });
        }
    },
    Book: {
        async author(root){
            const book = await Book.findOne({title:root.title}).populate("author")
            return {
                name: book.author.name,
                born: book.author.born,
                id: book.author._id,
            }
        }
    },
    Mutation: {
        async addBook(root,args,context) {
            if(!context.currentUser){
                throw new GraphQLError("Not authenticated",{
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }
            const book = new Book(args);
            const author = await Author.findOne({
                name: args.author
            });
            let newAuthorId = author?._id;
            if(!author){
                const newAuthor = new Author({
                    name: args.author,
                })
                newAuthorId = newAuthor._id;
                await newAuthor.save();
            }
            console.log(newAuthorId);
            book.author = newAuthorId;
            try{
                await book.save();
            } catch(err) {
                throw new GraphQLError("could not save book",{
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                        err
                    }
                })
            }
            return book;
        },
        editAuthor: async(root,args,context) => {
            if(!context.currentUser){
                throw new GraphQLError("Not authenticated",{
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }
            const author = await Author.findOne({name: args.name});
            console.log(author)
            if(!author) return null;
            author.born = args.setBornTo;
            try {
                await author.save();
            }
            catch(err){
                throw new GraphQLError("Could not edit author",{
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                        err
                    }
                })
            }
            return author;
        },
        async createUser(root,args){
            const user = new User(args);
            try{
                await user.save()
            }catch(err){
                throw new GraphQLError("Could not create user",{
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        err
                    }
                })
            }
            return user;
        },
        async login(root,args){
            const user = await User.findOne({username: args.username});
            if(!user && args.password !== 'secret') {
                throw new GraphQLError("invalid email or password",{
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                    }
                })
            }
            const userForToken = {
                username: user.name,
                id: user._id
            }
            return {value: jwt.sign(userForToken,process.env.SECRET)}
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), process.env.SECRET
            )
            const currentUser = await User
                .findById(decodedToken.id);
            return { currentUser }
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})