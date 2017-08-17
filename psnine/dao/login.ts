import { encodeForm } from '../utils'

const loginURL = 'http://psnine.com/set/signin/ajax'

export const registURL = `http://psnine.com/psnauth`

export const safeLogin = function (psnid, pass) {
  let signin = ''
  let details = { psnid, pass, signin }
  const formBody = encodeForm(details)
  return new Promise((resolve, reject) => {
    let isOK = true
    fetch(loginURL, {
      method: 'POST',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    }).then((responseData) => {
      if (responseData.status !== 200) {
        isOK = false
      }
      return responseData.text()
    }).then(text => {
      resolve({
        isOK,
        text
      })
    })
  })
}