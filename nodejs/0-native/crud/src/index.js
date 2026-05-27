import http from 'http'
import fs from 'fs'
import person from '../person.json' assert { type: "json" }
import url from 'url'

const server = http.createServer((req, res) => {
//get person
  if (req.method === 'GET' && req.url === '/api/person') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    console.log(url.parse(req.url, true))
    console.log(req.url)
    res.end(JSON.stringify(person))
//filter person
  } else if (req.method === 'GET' && req.url.match(/\/api\/person\/([0-9]+)/)) {
    const id = req.url.split('/')[3]
    const result = person.find(item => item.id = id)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result))
//add person
  } else if (req.method === 'POST' && req.url === '/api/person') {
    let newPerson = {
      id:7,
      name: 'Deniz',
      age: 23
    }
    person.push(newPerson)
    fs.writeFileSync('./person.json', JSON.stringify(person), 'utf8', (err => {
      err ? console.log(err) : console.log('Saved')
    }))
    res.writeHead(201, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(newPerson))
//update person
  } else if (req.method === 'PUT' && req.url.match(/\/api\/person\/([0-9]+)/)) {
    const id = req.url.split('/')[3]
    const findIdndex = person.findIndex(item => item.id == id)
    person[findIdndex] = {
      id,
      name:'Eko',
      age:19
    }
    fs.writeFileSync('./person.json', JSON.stringify(person), 'utf8', (err => {
      err ? console.log(err) : console.log('Updated')
    }))
    res.writeHead(201, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(id))
//remove person
  } else if (req.method === 'DELETE' && req.url.match(/\/api\/person\/([0-9]+)/)) {
    const id = req.url.split('/')[3]
    const result = person.filter(item => item.id != id)
    fs.writeFileSync('./person.json', JSON.stringify(result), 'utf8', (err => {
      err ? console.log(err) : console.log('Removed')
    }))
    res.writeHead(201, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(id))
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ "message": "Url not found" }))
  }
})
server.on('request', (req, res) => {
  console.log('listen request event with on eventhandler', req.url)
})
server.listen(3000, () => {
  console.log('Server is running...')
})