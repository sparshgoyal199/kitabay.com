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

let check = document.querySelector('#submit')
let resend = document.querySelector('#resend')
let otp = localStorage.getItem('otp');
let value = ''
let phone = localStorage.getItem('mobile')
let formData = {'Mobile_no':phone}


function checking(e){
    let a = document.querySelectorAll('.otpNumber')
    for (const i of a) {
        value += i.value
    }
    if (otp == value) {
        swal({
            icon:"success",
            text: "OTP verified",
            className: "sweetBox"
          }).then(() =>{
            window.open('/static/html_folder/password.html')
          })
    }
    else{
        swal({
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
    fetch('http://127.0.0.1:3000/forgot',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify(formData)
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
        swal({
            title: "Your new otp is",
            text: `${data}`,
            className: "sweetBox"
          }).then(()=>{
            otp = data
            let arr = document.querySelectorAll('#one')
            arr.forEach((input) => {input.value = ''})
        })});
}

check.addEventListener('click',checking)
resend.addEventListener('click',resending)