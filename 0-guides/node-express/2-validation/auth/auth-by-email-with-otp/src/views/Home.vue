<template>
  <div>
    <h2>{{ title }}</h2>
    {{ users }}
  </div>
</template>

<script>
export default {
  name:'Home',
  data () {
    return {
      title:'Home Page',
      users: {}
    }
  },
  mounted(){
    this.getUsers()
  },
  methods:{
    async getUsers(){
      const result = await fetch('/api/users')
      const final = await result.json()
      this.users = final.users
    }
  }
};
</script>

<style>
.token{
  margin-bottom: 40px;
}
</style>