import React from 'react';
import './App.css'

import Todo from './Todo';
import CreateTodo from './createTodo';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import LoginForm from './Login';
import { Login } from '@mui/icons-material';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
   
    <Stack spacing={2}>
      <CreateTodo /> 
      <Divider />
      <Todo/>
    </Stack>  <ReactQueryDevtools initialIsOpen={false} /></QueryClientProvider> 
  )
}

export default App
