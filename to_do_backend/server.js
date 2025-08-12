
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';



const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.get('/test',(req,res)=>{
    res.json({ message: 'Test endpoint is working!' });
})

var todo = [];

app.post('/create',async (req,res)=>{
    const { title, description, status = 'pending' } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const newTodo = await prisma.todo.create({
        data: {
            title,
            description,
            status
        }
    })

    //const newTodo = { id: todo.length + 1, title, description };

    //todo.push(newTodo);
    
    res.status(201).json(newTodo);
})

app.get('/todos',async (req,res)=>{
    const todo =await prisma.todo.findMany();
    res.json(todo);
})



app.get('/todos/:id',async (req,res)=>{
    const todoId = parseInt(req.params.id, 10);
    const foundTodo = await prisma.todo.findUnique({
        where: { id: todoId }
    });
    
    if (!foundTodo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(foundTodo);
});

app.put('/todos/:id', async (req, res) => {
    const todoId = parseInt(req.params.id, 10);
    const { title, description, status } = req.body;

    const existingTodo = await prisma.todo.findUnique({ where: { id: todoId } });

    if (!existingTodo) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedTodo = await prisma.todo.update({
        where: { id: todoId },
        data: { title, description, status }
    });

    res.json(updatedTodo);
});



app.delete('/todos/:id',async (req,res)=>{
    const todoId = parseInt(req.params.id, 10);
    const todoIndex = await prisma.todo.findUnique({
        where: { id: todoId }
});
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    await prisma.todo.delete({
        where: { id: todoId }
    });
    
    res.status(204).send();
})

app.listen(3001);

console.log('Server is running on port 3001');
