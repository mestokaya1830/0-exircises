const formValidate = (name ='', password ='', email = '') => {
  const errors = []
  if(name == '' || password == '' || email == ''){
    errors.push({message:'Please fill all field'})
  }else if(name.length < 3){
    errors.push({message:'Name must be less 4 charecters!'})
  } else if(email.length < 10) {
    errors.push({message:'Email must be less 10 charecters!'})
  }else if(password.length < 3){
    errors.push({message:'Password must be less 4 charecters!'})
  }
  return errors
}

export default formValidate