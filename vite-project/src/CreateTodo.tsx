import React from 'react'
import { useState } from 'react'
import { useQuery, useMutation, QueryClient, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

//function submits todo to route and handles errors
//returns: @void
async function submitTodo(todo) {
  if (todo === '') {
    alert('Please write something first')
  } else {
    console.log(todo)
    try { 
      const response = await fetch("http://localhost:8000/todolist/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify( {text: todo} ), 
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Todo created successfully:", data);
        // feedback successfull, message out? 
      } else {
        console.error("Error creating todo:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error in fetch:", error);
    }
  }
}
//Create a Todo 
//Component has input and button for todo creation
function CreateTodo() {
    const queryClient = useQueryClient();
    const [todo, setTodo] = useState('');

    //handles submitting the todo
    const handleButtonClick = () => {
        submitTodo(todo);
        setTodo('');
        mutate();
      };

    const { mutate } = useMutation({
        mutationFn: () => {
          return fetch("http://localhost:8000/todolist", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
        },
          // On success, update the cached data with the state
          onSettled: () => {
            queryClient.invalidateQueries();
          },
        }
      );
    // input and save from user with state
    // button onclick that sends to endpoint to make post with saved to do text

    //return a input with a state usage and button 
    return (
        <>

        <TextField id="input-text" label="Planner..." variant="standard" color='secondary'
            placeholder='add to do...'
            value={todo}  
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setTodo(event.target.value);
            }}
            InputLabelProps={{
                style: {
                  color: "#e63946", // Change label text color
                },
            }}
            InputProps={{
                style: {
                  color: "#e63946", // Change text color
                },
                sx: {
                  "& fieldset": {
                    borderColor: "#e63946", // Change border color  
                  },
                },
              }}
        />

        <Button variant='outlined'
        onClick={handleButtonClick}
        > Add To Do </Button>

        </>
    )
}
  
export default CreateTodo