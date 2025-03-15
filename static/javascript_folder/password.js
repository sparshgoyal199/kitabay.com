let header = document.querySelector('.header')
fetch('/static/html_folder/index.html')
.then(res => {
    res.text().then(data => {
        header.innerHTML = data
    })
})

let submit = document.querySelector('.submit')
let formData = {
    'Password':'',
    "Confirm_password":"",
    //"Mobile_no":`${localStorage.getItem('mobile')}`
    'Email_Address':`${localStorage.getItem('forgot_gmail')}`
}

function togging(event){
    event.preventDefault()
    let a = document.getElementsByName('Password')[0]
    if (a.type == "password") {
        a.type = 'text';
        event.target.childNodes[0].textContent = 'visibility_off'
        return;
    }
    else{
        a.type = 'password'
        event.target.childNodes[0].textContent = 'visibility'
    }
}

function submittings(e){
    e.preventDefault()
    form = document.querySelector('.form')
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

    fetch('/C_password',{
        method:'PUT',
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
        return res.json()
    })
    .then(data =>{
        swal.fire({
            icon:"success",
            text: "Password changed successfully",
            className: "sweetBox"
          }).then(()=>{
            localStorage.removeItem('forgot_gmail')
            window.open("/static/html_folder/insert_product.html")
          })
    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}
submit.addEventListener('click',submittings)