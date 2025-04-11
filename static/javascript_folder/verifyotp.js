let header = document.querySelector('.header')
fetch('/static/html_folder/index.html')
.then(res => {
    if (!res.ok) {
        throw new Error(res)
    }
    return res.text()
})
.then(data => 
    {header.innerHTML = data}
)
.catch(error => {
    console.log('some error occured');
    header.innerHTML = 'Some error occured'
})

const BASE_URL = (window.location.hostname.toString() === '127.0.0.1') ? 'http://localhost:80' : 'https://kitabay-com-455z.onrender.com'
let check = document.querySelector('#submit')
let resend = document.querySelector('#resend')
let value = ''
let otp = localStorage.getItem('signup_otp')
localStorage.removeItem('signup_otp')

let form_data = JSON.parse(localStorage.getItem('object'))
localStorage.removeItem('object')

if(!otp){
    otp = localStorage.getItem('forgot_otp')
    localStorage.removeItem('forgot_otp')
}

let gmail;
if (form_data) {
   gmail = {'Email_Address':form_data.Email_Address}
}
else{
    gmail = {'Email_Address':localStorage.getItem('forgot_gmail')}
}


function checking(e){
    let a = document.querySelectorAll('.otpNumber')
    for (const i of a) {
        value += i.value
    }
    
    if (otp == value) {
        if (form_data) {
            fetch(`${BASE_URL}/postingData`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(form_data)
            }).then(res => {
                if (!res.ok) {
                    if (res.status == 422) {
                        return res.text().then(response => {
                            throw new Error(response.substring(11,response.length-2))
                        })    
                    }
                    else{
                        throw new Error(res)
                    }
                }
                return res.json()}
            ).then(data => {
                swal.fire({
                    icon:"success",
                    text: `${data}`,
                    className: "sweetBox"
                  }).then(() =>{
                    form_data = ''
                    gmail = ''
                    window.location.replace('/static/html_folder/log_in.html')
                  })
            }).catch(e => {
                swal.fire({
                    icon:"error",
                    text: `${e}`,
                    className: "sweetBox"
                  }).then(()=>{
                    let arr = document.querySelectorAll('#one')
                    arr.forEach((input) => {input.value = ''})
                    value = ''
                  })
            })
        }
        else{
            swal.fire({
            icon:"success",
            text: "OTP verified",
            className: "sweetBox"
          }).then(() =>{
            window.location.replace('/static/html_folder/password.html')
          })
        }
    }
    else{
        swal.fire({
            title: "Incorrect OTP",
            text: `${value}`,
            className: "sweetBox"
          }).then(()=>{
            value = ''
            let arr = document.querySelectorAll('#one')
            arr.forEach((input) => {input.value = ''})
        })
    }
}

function resending(e){
    fetch(`${BASE_URL}/forgot`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify(gmail)
    })
    .then(res => {
        if (!res.ok) {
            if (res.status == 422) {
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })    
            }
            else{
                throw new Error(res)
            }
        }
        return res.json()}
)
    .then(data =>{
        swal.fire({
            icon:"success",
            text: `OTP sent to ${JSON.stringify(gmail.Email_Address)}`,
            className: "sweetBox"
          }).then(()=>{
            otp = data
            let arr = document.querySelectorAll('#one')
            arr.forEach((input) => {input.value = ''})
        })});
}

check.addEventListener('click',checking)
resend.addEventListener('click',resending)