import React, {useState, useEffect} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'


const PET_FIELDS = gql`
  fragment petFields on Pet{
    id
    type
    name
    img
    # directive on the field added locally
    lifeSpan @client
    vaccinated @client
  }
`
const GET_PETS = gql`
${PET_FIELDS}
query getPets{
  pets{
    ...petFields
  }
}
`

const ADD_PET = gql`
  ${PET_FIELDS}
  mutation addPet($newPet: NewPetInput!){
    addPet(input: $newPet){
    ...petFields
  }
}
`

export default function Pets () {
  const [ modal, setModal ] = useState(false);

  const { data, loading, error } = useQuery(GET_PETS);

  const [ createPet, addPetMeta ] = useMutation(ADD_PET, {
    
    update:(cache, { data: { addPet }})=>{

      const { pets } = cache.readQuery({ query: GET_PETS });
      cache.writeQuery({ query: GET_PETS, data:{ pets: [ addPet, ...pets] }});

    }
  });
  

  if( loading ){ return <Loader /> }

  if(error){ return <h2>Error Occurred</h2> }

  const onSubmit = input => {
    setModal(false);
    createPet({ 
          variables: { newPet: input },
          optimisticResponse: {
            __typename: "Mutation",
            addPet: {
              id: "1",
              type: input.type,
              name: input.name,
              img: "https://via.placeholder.com/300",
              vaccinated: "YES",
              lifeSpan: "12 years",
              __typename: "Pet"   
            }
          }

    });
  }


  
  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={ data.pets }/>
      </section>
    </div>
  )
}
