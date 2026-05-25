import otp from 'otp-generator'

const otpGen = () => {
  return otp.generate(10, {
    uppperCaseAlphabets: true,
    specialChars: true,
    digits: true
  })
}

export default otpGen