const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const { copyFileSync } = require("fs");
const q = faunadb.query;

const typeDefs = gql`
  type Query {
    todos: [Todo!]
  }

  type Mutation {
    addTodo(todo: String!): Todo
  }

  type Todo {
    id: ID!
    todo: String
  }
`;

const client = new faunadb.Client({
  secret: process.env.FAUNADB_ADMIN_SECRET,
  domain: "db.eu.fauna.com",
});

const resolvers = {
  Query: {
    todos: async () => {
      try {
        const result = await client.query(
          q.Map(
            q.Paginate(q.Documents(q.Collection("todos"))),
            q.Lambda((x) => q.Get(x))
          )
        );
        const data = result.data.map((d) => {
          return {
            id: d.ref.id,
            todo: d.data.todo,
          };
        });

        return data;
      } catch (err) {
        return error.toString();
      }
    },
  },

  Mutation: {
    addTodo: async (_, { todo }) => {
      try {
        const result = await client.query(
          q.Create(q.Collection("todos"), {
            data: {
              todo: todo,
            },
          })
        );
        return result;
      } catch (err) {
        return error.toString();
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler();
