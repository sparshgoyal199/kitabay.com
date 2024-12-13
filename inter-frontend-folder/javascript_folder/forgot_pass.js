
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
    'Mobile_no':""
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
    fetch('http://127.0.0.1:8011/forgot',{
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
            title: "Your otp is",
            text: `${data}`,
            closeOnEsc: false,
            closeOnClickOutside: false,
            className: "sweetBox"
          }).then((value) => {
            otp_data = data
            localStorage.setItem('mobile',formData['Mobile_no'])
            localStorage.setItem('otp',otp_data)
            window.open('/static/html_folder/verify_otp.html')
          });

    })
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

submits.addEventListener('click',forgotting)

