let header = document.querySelector('.header')
fetch('/html_folder/index.html')
.then(res => {
    res.text().then(data => {
        header.innerHTML = data
    })
})

let submit = document.querySelector('.submit')
let formData = {
    'Password':'',
    "Confirm_password":"",
    "Mobile_no":`${localStorage.getItem('mobile')}`
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
        console.log('validation occurring...');
        return ;
    }

    fetch('http://127.0.0.1:8011/C_password',{
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
        swal({
            icon:"success",
            text: "Password changed successfully",
            className: "sweetBox"
          })
    })
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}
submit.addEventListener('click',submittings)