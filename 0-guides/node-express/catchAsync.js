const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync


//different version
const cacthAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next).catch(next))
}

export default cacthAsync
