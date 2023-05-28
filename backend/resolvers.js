const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const { GraphQLError } = require("graphql/error");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) return Book.find({}).populate("author");
      if (args.author && !args.genre)
        return Book.find({}).populate("author").find({
          "author.name": args.author,
        });
      if (!args.author && args.genre)
        return Book.find({
          genres: args.genre,
        }).populate("author");
      if (args.author && args.genre)
        return Book.find({}).populate("author").find({
          "author.name": args.author,
          genres: args.genre,
        });
    },
    allAuthors: async () => Author.find({}),
    allUsers: async () => User.find({}),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    async bookCount(root) {
      console.log("book.count");
      return Book.countDocuments({ author: root._id });
    },
  },
  Book: {
    async author(root) {
      const book = await Book.findOne({ title: root.title }).populate("author");
      return {
        name: book.author.name,
        born: book.author.born,
        id: book.author._id,
      };
    },
  },
  Mutation: {
    async addBook(root, args, context) {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const book = new Book(args);
      const author = await Author.findOne({
        name: args.author,
      });
      let newAuthorId = author?._id;
      if (!author) {
        const newAuthor = new Author({
          name: args.author,
        });
        newAuthorId = newAuthor._id;
        await newAuthor.save();
      }
      console.log(newAuthorId);
      book.author = newAuthorId;
      try {
        await book.save();
      } catch (err) {
        throw new GraphQLError("could not save book", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            err,
          },
        });
      }
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      return book;
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const author = await Author.findOne({ name: args.name });
      console.log(author);
      if (!author) return null;
      author.born = args.setBornTo;
      try {
        await author.save();
      } catch (err) {
        throw new GraphQLError("Could not edit author", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            err,
          },
        });
      }
      return author;
    },
    async createUser(root, args) {
      const user = new User(args);
      try {
        await user.save();
      } catch (err) {
        throw new GraphQLError("Could not create user", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            err,
          },
        });
      }
      return user;
    },
    async login(root, args) {
      const user = await User.findOne({ username: args.username });
      if (!user && args.password !== "secret") {
        throw new GraphQLError("invalid email or password", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
          },
        });
      }
      const userForToken = {
        username: user.name,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, process.env.SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
