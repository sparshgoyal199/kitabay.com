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
//let otp = localStorage.getItem('otp');
let value = ''
//let phone = localStorage.getItem('mobile')
//let formData = {'Mobile_no':phone}
let otp = localStorage.getItem('signup_otp')
if(!otp){
    otp = localStorage.getItem('forgot_otp')
}
let form_data = JSON.parse(localStorage.getItem('object'))
let gmail;
if (form_data) {
   gmail = {'Email_Address':form_data.Email_Address}
}
else{
    gmail = localStorage.getItem('forgot_gmail')
}

/*function checking_otp(){

}*/

function checking(e){
    let a = document.querySelectorAll('.otpNumber')
    for (const i of a) {
        value += i.value
    }
    
    if (otp == value) {
        if (form_data) {
            //that means it is sign_up wala otp
            fetch('/postingData',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(form_data)
                //body:JSON.stringify(formData)
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
                swal({
                    icon:"success",
                    text: `${data}`,
                    className: "sweetBox"
                  }).then(() =>{
                    form_data = ''
                    gmail = ''
                    localStorage.removeItem('object')
                    localStorage.removeItem('signup_otp')
                    window.location.replace('/static/html_folder/log_in.html')
                    //window.top.close();
                    //window.open('/static/html_folder/log_in.html','_self')
                  })
            }).catch(e => {
                swal({
                    icon:"error",
                    text: `${e}`,
                    className: "sweetBox"
                  })
            })
        }
        else{
            swal({
            icon:"success",
            text: "OTP verified",
            className: "sweetBox"
          }).then(() =>{
            localStorage.removeItem('forgot_otp')
            //localStorage.removeItem('forgot_gmail')
            window.location.replace('/static/html_folder/password.html')
          })
        }
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
    fetch('/forgot',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify(gmail)
        //body:JSON.stringify(formData)
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