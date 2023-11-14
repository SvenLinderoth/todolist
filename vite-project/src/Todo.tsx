import {  useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import './index.css';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import '@fontsource/roboto/300.css';
import { Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
// import Card from '@mui/material/Card';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


const DemoPaper = styled(Paper)(({ theme }) => ({
    width: 'auto', // width to 'auto' so expands based on content
    minWidth: 200, 
    maxWidth: 350, 
    padding: theme.spacing(2),
    ...theme.typography.body2,
    elevation: 3,
    display: "flex",
    alignItems: "center",
    verticalAlign: "middle",
    justifyContent: "space-between",
    background: '#e63946',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.2), 0 0 6px rgba(0, 0, 0, 0.2)',
    borderRadius: "18px",
    color: '#fff', 
}));
const DemoPaperNotComplete = styled(Paper)(({ theme }) => ({
    width: 'auto', 
    minWidth: 200, 
    maxWidth: 350, 
    padding: theme.spacing(2),
    ...theme.typography.body2,
    elevation: 3,
    display: "flex",
    alignItems: "center",
    verticalAlign: "middle",
    justifyContent: "space-between",
    background: '#C13540',
    boxShadow: '1px 3px 6px rgba(50, 50, 50, 0.2), 1px 2px 3px rgba(0, 0, 0, 0.2), 0 0 6px rgba(0, 0, 0, 0.2)',
    borderRadius: "18px",
    color: '#FFEFF0',
    textDecorationLine: 'line-through',
}));
const MiniNavCard = styled(IconButton)(({theme}) => ({
}));

const TodoTypography = styled(Typography)(({theme}) => ({
}));

//--------------------------------
// Todo List 
// Returns with all todos
//--------------------------------
function Todo() {
    const queryClient = useQueryClient();

    const LIMIT = 5;
    const fetchTodos = async ({ pageParam = 0 }) => {

    const response = await fetch(
      `http://localhost:8000/todolist?_page=${pageParam}&_limit=${LIMIT}`
    );
    const data = await response.json();
    // console.log(data)
    return data;
};

    const {
    data,
    isSuccess,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['todolist'],
    queryFn: fetchTodos,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < LIMIT ? undefined : allPages.length
    },
  });
  //mutation
  //fungerar men känns hackig i sin render
  //behöver ändra logiken i hur data hämtas/displayas
  // const updateTodo = useMutation(
  //   (item) => {
  //     return fetch("http://localhost:8000/checkbox", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify( item ),
  //     });
  //   },
  //   {
  //     // On success, update the cached data with the new checkbox state
  //     onSettled: () => {
  //       queryClient.invalidateQueries();
  //     },
  //   });
  //trying different approach with querydata
  // const updateTodo = useMutation('todolist', {
  //   onSuccess: data => {
  //     console.log(data.pages)
  //     queryClient.setQueryData(['todolist', { id: data }], data)
  //   }
  // })
  const updateTodo = useMutation({
        mutationFn: async (item) => {
          const response = await fetch("http://localhost:8000/checkbox", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify( item ),
            });
            const data = await response.json();
            return data;
        },
        onSuccess: data => {
          queryClient.setQueryData(['todolist', { id: data[0].id, content: data[0].content, complete: data[0].complete }], data)
        }
    })
    const deleteTodo = useMutation({
      mutationFn: (item) => {
        return fetch("http://localhost:8000/todolist/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify( item ),
        });
      },
        // On success, update the cached data with the new checkbox state
        onSettled: () => {
          queryClient.invalidateQueries();
        },
      });
    //handles checkBox change by mutating the item, which calls the /checkbox endpoint
    //better way would be to mutate with fetch todolist, and make the checkbox fetch in this function instead.
    const handleCheckboxChange = (item) => async () => {
      updateTodo.mutate(item);
    };
    //handles specific todolist deletion
    const deleteItem = (item) => async () => {
        deleteTodo.mutate(item);
    }

    const newData = data?.pages.flat();

return (
    <Stack spacing={2}
    divider={<Divider orientation="vertical" flexItem />}
    >
        { isSuccess && 
        newData?.map((item, i) =>
         (!item.complete ? (
          <DemoPaper key={item.id} square={false} >
            <TodoTypography>{item.content}
            </TodoTypography>
            <MiniNavCard>
            <Checkbox
              checked={item.complete} 
              onChange={handleCheckboxChange(item)}
              sx={{
                color: "#fff",
                '&.Mui-checked': {
                  color: "#90EE90",
                },
              }}
            />
            <IconButton aria-label="delete"onClick={deleteItem(item)}>
                <DeleteIcon />
            </IconButton>

            </MiniNavCard>
          </DemoPaper>
          ) :    
        <DemoPaperNotComplete key={item.id} square={false} >
          <TodoTypography>
            {item.content}
          </TodoTypography>
          <MiniNavCard>
          <Checkbox
            checked={item.complete} 
            onChange={handleCheckboxChange(item)}
            sx={{
              color: "#fff",
              '&.Mui-checked': {
                color: "#90EE90",
              },
            }}
          />
          <IconButton aria-label="delete"onClick={deleteItem(item)}>
              <DeleteIcon />
          </IconButton>
          </MiniNavCard>
      </DemoPaperNotComplete>
))}
       <Button onClick={() => fetchNextPage()} variant='outlined'>
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </Button> 
    </Stack>
  )
}

export default Todo;
