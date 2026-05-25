app.post('/newuser', async (req, res) => {
  try {
    const newUsers = req.body.newuser.map(user => ({
      name: user.name,
      lastname: user.lastname,
      age: user.age,
    }))

    await users.insertMany(newUsers)

    res.status(201).json({
      success: true,
      message: 'Users created',
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})


//eger burada bcrypt olsaydı Promise.all kullanmak mantıklı olurdu çünkü hash işlemleri async ve pahalı işlemler.

app.post('/newuser', async (req, res) => {
  try {
    const newUsers = await Promise.all(
      req.body.newuser.map(async user => ({
        name: user.name,
        lastname: user.lastname,
        age: user.age,
        password: await bcrypt.hash(user.password, 10),
      }))
    )

    await users.insertMany(newUsers)

    res.status(201).json({
      success: true,
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      success: false,
    })
  }
})
