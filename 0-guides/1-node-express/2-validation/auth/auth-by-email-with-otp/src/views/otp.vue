<template>
  <div>
    <div class="register-con">
      <h2>Register Complation</h2>
      <input type="text" name="" id="otp" placeholder="otp">
      <p class="message">{{ message }}</p>
      <button @click="register()">Complete</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Otp',
  data() {
    return {
      message: ''
    }
  },
  methods: {
    async register() {
      const result = await fetch('/api/check-otp', {
        method: 'Post',
        headers: { "Content-type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          otp: document.getElementById('otp').value,
        })
      })
      const final = await result.json()
      if(final.code == '200'){
        this.$router.push('/')
      } else {
        this.message = final.message
      }
    },
  }
}
</script>
<style>
.register-con{
  display: flex;
  flex-direction: column;
  width: 400px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
}
.register-con input{
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