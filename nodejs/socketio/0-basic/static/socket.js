let socket = io()

    let messages = document.getElementById('messages')
    let form = document.getElementById('form')
    let input = document.getElementById('input')

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      if (input.value) {
        socket.emit('client-message', input.value)
        input.value = ''
      }
    })

    socket.on('server-message', function (msg) {
      var item = document.createElement('li')
      item.textContent = msg
      messages.appendChild(item)
      window.scrollTo(0, document.body.scrollHeight)
    })