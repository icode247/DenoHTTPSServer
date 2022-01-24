import { serve, serveTls} from "https://deno.land/std@0.122.0/http/server.ts";
import { pathToRegexp } from "https://raw.githubusercontent.com/pillarjs/path-to-regexp/master/src/index.ts";

let todos = new Array()

async function server(req: Request): Promise<Response> {
  const url = new URL(req.url).pathname;
  const method = req.method;
  const todoRegex = pathToRegexp("/todo/:id");
  const match = todoRegex.exec(url);

  // GET /
  if (method === "GET" && url.toString() === "/") {
    return new Response(JSON.stringify({ message: "This is a Deno HTTPS Server" }), { status: 200 });

  }

  // GET /todo
  if (method === "GET" && url.toString() === "/todo") {
    return new Response(JSON.stringify(todos), { status: 200 })
  }

  // POST /todo
  if (method === "POST" && url.toString() === "/todo") {
    const { name } = await req.json();
    const todoObj = { id: todos.length + 1, name, staus: "false", createdAt: Date.now() }
    todos.push(todoObj)
    return new Response(JSON.stringify(todoObj), { status: 201 })
  }

  // GET /todo/:id
  if (method === "GET" && match) {

    const id = Number(match[1]);
    const todoIndex = todos.findIndex((obj => obj.id == id));

    if (todoIndex != -1) {

      return new Response(JSON.stringify(todos[todoIndex]), { status: 200 })
    }
    return new Response(JSON.stringify({ message: "Todo Not Found" }), { status: 404 })
  }

  // PUT /todo/:id
  if (method === "PUT" && match) {
    const { name, status } = await req.json();
    const id = Number(match[1]);
    const todoIndex = todos.findIndex((obj => obj.id == id));

    if (todoIndex != -1) {
      todos[todoIndex].name = name,
        todos[todoIndex].status = status
      return new Response(JSON.stringify(todos[todoIndex]), { status: 200 })
    }
    return new Response(JSON.stringify({ message: "Todo Not Found" }), { status: 404 })
  }

  // DELETE /todo/:id
  if (method === "DELETE" && match) {
    const id = Number(match[1]);
    const todoIndex = todos.findIndex((obj => obj.id == id));

    if (todoIndex != -1) {
      todos.splice(todoIndex, 1)
      return new Response(JSON.stringify({ message: "Todo Not Found", todos }), { status: 404 })
    }
    return new Response(JSON.stringify({ message: "Todo Not Found" }), { status: 404 })
  }
  return new Response(JSON.stringify({ message: "URL DOES NOT Exist" }), { status: 404 });
}

serveTls(server, {
  port: 4000,
  certFile: "./cert.pem",
  keyFile: "./key.pem"
});
