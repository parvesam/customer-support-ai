'use client'
import Image from "next/image";
import { useState } from "react"; //import our messages
import {Box, TextField} from '@mui/material'
import {Stack, Button} from '@mui/material'

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi! I am the Headstarter Support Agent, How can I assist you today? '
  }])

  //message you will be typing
  const [message, setMessage] = useState('')

  //send messages and return response
  const sendMessage = async()=>{
    setMessage('')
    setMessages((messages)=>[
      ...messages, 
      {role: "user", content: message},
      {role: "assistance", content:""}
    ])
    const response = fetch('/api/chat', {
      method: "POST",
      headers:{
        'Content-Type': 'applications/json'
      },
      body: JSON.stringify([...messages, {role: "user", content: message}])
    }).then(async (res)=>{
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ""
      return reader.read().then(function processText({done, value}) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream:true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ]
        })
        return reader.read().then(processText) //recursive
      })
    })
  }

  return <Box width="100vw" height="100vh" display = "flex" flexDirection="column" justifyContent= "center" alignItems="center">
    <Stack direction = "column" width = "600px" height = "700px" border = "1px solid black" p={2} spacing={3}>
      <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
        {
          //display messages
          messages.map((message, index)=>(
            <Box key={index} display = "flex" justifyContent={
              message.role === 'assistant'? 'flex-start' : 'flex-end'
            }>
            <Box bgcolor={
              message.role === 'assistant' ? 'primary.main' : 'secondary.main'
            }
            color="white"
            borderRadius={16}
            p={3}>
              {message.content}
            </Box>
            </Box>
          ))}
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="message" fullWidth value={message} onChange={(e) => setMessage(e.target.value)}/>
          <Button variant= "contained" onClick={sendMessage}>
            Send
          </Button>
      </Stack>
    </Stack>
  </Box>
}
