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
    header.innerHTML = 'Some error occured'
})

const BASE_URL = (window.location.hostname.toString() === '127.0.0.1') ? 'http://localhost:80' : 'https://kitabay-com-455z.onrender.com'
let getFlag =  {};
let form = document.querySelector('.form')
let phoneCode = document.querySelector('.selected')
let submit = document.querySelector('.submit')
let changing = document.querySelector('.all')
let exist = document.querySelector('.existing')
let formData = {
    'Username':"",
    'Email_Address':"",
    'Password':"",
    'Confirm_password':"",
    'Code':"",
    'Mobile_no':""
};
let allCodes,allcodesJson


(async function printing(){
    let data = document.querySelector('.selection')
    if (allcodesJson == null || allcodesJson == undefined) {
        allCodes = await fetch('https://countriesnow.space/api/v0.1/countries/codes')
        allcodesJson = await allCodes.json()
    }
    for (const i of allcodesJson["data"]) {
        let createOption = document.createElement('option')
            createOption.textContent = `${i['name']}`
            createOption.value =  `${i['dial_code']}`
            getFlag[`${i['dial_code']}`] = i['code'].toLowerCase()
            data.append(createOption)
    }
})()

async function running(e){
    e.target.previousElementSibling.src = `https://flagpedia.net/data/flags/h80/${getFlag[e.target.value].toLowerCase()}.png`
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


async function submitting(e){    
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
    fetch(`${BASE_URL}/posting`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Access-Control-Allow-Origin':'http://127.0.0.1:5502'
        },
        body:JSON.stringify(formData)
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            })
        }
        return res.json()
    })
    .then(data =>{
        let form_data = data[0]
        localStorage.setItem('object',JSON.stringify(form_data))
        localStorage.setItem('signup_otp',data[1])
        swal.fire({
            icon:"success",
            text: `OTP sent to ${JSON.stringify(form_data.Email_Address)}`,
            className: "sweetBox"
          }).then(()=>{
            window.open("/static/html_folder/verify_otp.html","_parent")
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


phoneCode.addEventListener('change',running)
submit.addEventListener('click',submitting)
changing.addEventListener('change',myfunc)
