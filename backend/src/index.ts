    import dotenv from "dotenv";
    import express, { Express, Request, Response } from "express";
    import sql from "./db";
    import cors from 'cors';

    dotenv.config();

    const app: Express = express();
    const port = 8000;
    // const port = process.env.PORT;
    
    app.use(cors())
    app.use(express.json())

    ///todolist : Sends todolists from db
    //limit = set a limit to number of posts being fetched
    //page = set offset in context to limit
    app.get("/todolist", async (req: Request, res: Response) => {
        const { _page, _limit } = req.query;
        const page = Number(_page);
        const limit = Number(_limit);
        const offset = page * limit;
        try {
            const todolist = await sql`
                SELECT * 
                FROM todolist
                ORDER BY complete ASC
                LIMIT ${limit}
                OFFSET ${offset}
            `;
            res.status(200).json(todolist);
        } catch (error) {
            console.error("Error fetching todolist:", error);
            res.status(500).send("Internal Server Error");
        }
    })
    ///todolist/submit : call to submit a todo post
    //request param: text
    //returns: res status, success or error
    app.post("/todolist/submit", async (req, res) => {
        const { text } = req.body;
        try {
            await sql`
              INSERT INTO todolist (content)
              VALUES (${text})`;
            res.status(201).json({ message: "To-do post created successfully" });
        } catch (error) {
            console.error("Error creating todo:", error);
        }
    })
    ///checkbox : call when checkbox is being pressed to handle true and false values on complete
    //ID must be same as checkboxes parent ID, check from value saved with database id on todo
    app.put("/checkbox", async (req, res) => {
        const { content, id, complete } = req.body;
        //om complete som skickas från checkklick är true, sätt checkbox i db till false /vv
        try {
            if (complete) {
                const item = await sql`
                UPDATE todolist SET complete = false WHERE id=${id} RETURNING content, id, complete`
                res.status(201).json(item);
            } 
            else {
                const item = await sql`
                UPDATE todolist SET complete = true WHERE id=${id} RETURNING content, id, complete`;
                res.status(201).json(item);
            }
            }   
            catch (error) {
                console.error("Error setting complete true:", error);
            }
    })
    ///todolist/delete : deletes todopost
    //req: object of todopost, including content, id and complete.
    app.post("/todolist/delete", async (req, res) => {
        const { content, id, complete } = req.body;
        //om complete som skickas från checkklick är true, sätt checkbox i db till false /vv
        try {
            await sql`
            DELETE FROM todolist WHERE id=${id}`
            res.status(201).json({ message: "Post deleted successfully" });
            }   
            catch (error) {
                console.error("Error when deleting post: ", error);
            }
    })

    app.post("/auth-login", async (req, res) => {
        const { username, password } = req.body;
        console.log(username, password)
        //exists, exists in ? annorlunda command i expressjs ?
            try {
                const user = await sql`
                SELECT * FROM auth
                WHERE username=${username} AND password=${password}
            `;
            user.length > 0 ? res.status(201).json({ message: "Signed in" }) : 
            res.status(408).json({ message: "User does not exist" })
        } catch (error) {
            console.error("Error when deleting post: ", error);
        } 
    })

    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });