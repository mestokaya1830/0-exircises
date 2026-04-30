const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync


//different version
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default catchAsync



👉// Async + try/catch + next(err)
const handler = async (req, res, next) => {
  try {
    const data = await someAsyncFunction()

    if (!data) {
      throw new ErrorHandler("Data not found", 400)
    }

    res.json({ success: true, data })
  } catch (err) {
    return next(err)
  }
}

👉//Sync middleware → next(err)(no async no trycatch)
const auth = (req, res, next) => {
  const token = '1234'

  if (!token) {
    return next(new ErrorHandler("Not authorized", 401))
  }
  next()
}

👉//Async + catchAsync → throw (async and catch)
router.get('/', catchAsync(async(req, res, next) => {
const user = ''
if(!user){
    throw new ErrorHandler("Not authorized", 401)
}
  res.json({
    success: true,
    message: 'Home Page'
  })
}))
