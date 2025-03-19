
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


let form = document.querySelector('.form')
let submits = document.querySelector('.submit')

let formData = {
    'Email_Address':''
}
let otp_data = 0


function forgotting(e){
    for (const i of form) {
        if(i.name != 'button'){
            if (i.value) {
                formData[i.name] = i.value
            }
            else{
                formData[i.name] = undefined
            }
        }
    }
    if (!form.reportValidity()) {
        return ;
    }

    e.preventDefault()
    fetch('/forgot',{
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
        swal.fire({
            icon:"success",
            text: `OTP sent to ${JSON.stringify(formData.Email_Address)}`,
            className: "sweetBox"
          }).then((value) => {
            otp_data = data
            localStorage.setItem('forgot_otp',otp_data)
            localStorage.setItem('forgot_gmail',formData['Email_Address'])
            window.open('/static/html_folder/verify_otp.html','_parent')
          });

    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

submits.addEventListener('click',forgotting)

