import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import gql from 'graphql-tag'

/**
 * Create a new apollo client and export as default
 */

// local state added using apollo client which will be queried in the same way as other queries returning data from the server 
const typeDefs = gql`
    enum vaccine{
        YES
        NO
    }
    extend type Pet{
        lifeSpan: String!
        vaccinated: vaccine!
    }
`
const resolvers = {
    Pet:{
        lifeSpan:(pet)=>{
            return pet.type ==='CAT'? '12 years': '20 years';
        },
        vaccinated:(pet)=>{
            return 'YES'
        }
    }
    
}

const delay = setContext(
    async request => {
        await new Promise((success, fail)=>{
            setTimeout(()=>{
                success();
            }, 800)
        })
    }
)
const httpLink = new HttpLink({uri: "http://localhost:4000/"});

const cache = new InMemoryCache();

const link = ApolloLink.from([
    delay,
    httpLink

])

const client = new ApolloClient({
    link, 
    cache,
    typeDefs,
    resolvers
})

export default client;
