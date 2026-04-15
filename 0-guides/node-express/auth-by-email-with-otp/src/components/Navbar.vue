<template>
  <div>
    <nav>
      <router-link to="/" class="links">Home</router-link>
      <router-link to="/login" class="links">Login</router-link>
      <router-link to="/register" class="links">Register</router-link>
      <router-link to="" class="links" @click="logout()">Logout</router-link>
    </nav>
  </div>
</template>

<script>
 export default {
  name:'Navbar',
  data () {
    return {

    }
  },
  methods: {
    logout(){
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  },
 }
</script>
<style scoped>
  nav{
    display: flex;
  }
  .links{
    margin: 10px;
  }
  .links{
    text-decoration: none;
  }
  .active{
    color: green;
  }
</style>
