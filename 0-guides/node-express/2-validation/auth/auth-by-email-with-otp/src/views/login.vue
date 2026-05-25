<template>
  <div>
    <div class="login-con">
      <h2>Login</h2>
      <input type="text" name="" id="login-name" placeholder="name">
      <input type="text" name="" id="login-password" placeholder="password">
      <p class="message">{{ message }}</p>
      <button @click="login()">Login</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      message: ''
    }
  },
  methods: {
    async login() {
      const result = await fetch('/api/login', {
        method: 'Post',
        headers: { "Content-type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          name: document.getElementById('login-name').value,
          password: document.getElementById('login-password').value
        })
      })

      const final = await result.json()
      if(final.error){
        this.message = final.error
        return false
      } else {
        this.$router.push('/')
      }
    },
  }
}
</script>

<style>
.login-con{
  display: flex;
  flex-direction: column;
  width: 400px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
}
.login-con input{
  width: 100%;
  height: 34px;
  padding-left: 10px;
  border: 1px solid #ddd;
  margin: 5px 0;
}
button{
  width: 100%;
  background-color: #ddd;
  border-radius: 4px;
  margin-top: 20px;
}
.message{color:red;}
</style>