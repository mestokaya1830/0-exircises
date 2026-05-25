//set try catch block
const tryCatch = (controller) => async(req, res, next) => {
  try {
    await controller(req, res)
  } catch (error) {
    return next(error.message)
  }
}
export default  tryCatch