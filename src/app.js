const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function checkRouteId(request, response, next){
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({message: "Id most be a uuid"})
  }

  return next()
}

function checkIfExist(request, response, next){
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0){
    return response.status(400).json({message: "Repository not found"});
  }

  request.repositoryIndex = repositoryIndex;

  return next()
}

app.use("/repositories/:id",checkRouteId, checkIfExist)
app.use("/repositories/:id/like",checkRouteId, checkIfExist)

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  if(!title || !url || !techs){
    return response.status(400).json({message: "Insuficiente data"})
  }
  const repository = {
    id: uuid(),
    title, 
    url,
    techs,
    likes: 0
  }

  repositories.push(repository)

  return response.json(repository)
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0){
    return response.status(400).json({message: "Repository not found"})
  }

  const { title, url, techs } = request.body;

  const updatedRepository = {
    id,
    title: title || repositories[repositoryIndex].title, 
    url: url || repositories[repositoryIndex].url, 
    techs: techs || repositories[repositoryIndex].techs,
    likes: repositories[repositoryIndex].likes
  }

  repositories[repositoryIndex] = updatedRepository;

  return response.json(updatedRepository)
});

app.delete("/repositories/:id", (request, response) => {
  const { repositoryIndex } = request

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
});

app.post("/repositories/:id/like", (request, response) => {
  const { repositoryIndex } = request

  repositories[repositoryIndex].likes = repositories[repositoryIndex].likes + 1;

  return response.json(repositories[repositoryIndex])
});

module.exports = app;
