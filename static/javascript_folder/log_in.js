let header = document.querySelector('.header')
let login = document.querySelector('.submit')
let form = document.querySelector('.form')
let formData = {
    "Email_Address":"",
    "Password":""
}


const BASE_URL = (window.location.hostname.toString() === '127.0.0.1') ? 'http://localhost:80' : 'https://kitabay-com-455z.onrender.com'

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

function submitting(e){
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
    fetch(`${BASE_URL}/logging`,{
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
        return res.json()
    })
    .then(data =>{
        console.log(data);
        localStorage.setItem("token",data)
        swal.fire({
            icon:"success",
            text: "Log in successfully",
            className: "sweetBox"
          }).then(() => {
            window.open("/static/html_folder/insert_product.html", "_parent");
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
login.addEventListener('click',submitting)