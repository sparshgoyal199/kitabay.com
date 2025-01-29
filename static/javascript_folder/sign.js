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



(async function printing(){
    let data = document.querySelector('.selection')
    let allCodes,allcodesJson
    if (allcodesJson == null && allcodesJson == undefined) {
        allCodes = await fetch('https://restcountries.com/v3.1/independent?status=true')
        allcodesJson = await allCodes.json()
    }
    for (const i of allcodesJson) {
        let createOption = document.createElement('option')
            createOption.textContent = `${i['name']['common']}`

            createOption.value =  `${i['idd']['root']}${i['idd']['suffixes'][0]}`

            getFlag[`${i['idd']['root']}${i['idd']['suffixes'][0]}`] = i['cca2']
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

function myfunc(event){
    let a = event.target.value.length
    if(a == 3){
        document.querySelector('.all').style.width = `${a*18}px`
        return ;
    }
    if(a == 5){
        document.querySelector('.all').style.width = `${a*15.5}px`
        return ;
    }
    if(a == 6){
        document.querySelector('.all').style.width = `${a*13}px`
        return ;
    }
    if(a <= 10 && a > 6){
        document.querySelector('.all').style.width = `${a*11.5}px`
        return ;
    }
    if(a <= 14 && a > 10){
        document.querySelector('.all').style.width = `${a*9}px`
        return ;
    }
    else{
        document.querySelector('.all').style.width = `${a*8.5}px`
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
    fetch('https://my-fastapi-app.onrender.com/posting',{
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
            if (res.status == 421) {
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })    
            }
            if (res.status == 400) {
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })    
            }
            if (res.status == 402) {
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })
            }
            if (res.status == 403) {
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })
            }
            if (res.status == 405) {
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })
            }
        }
        return res.json()
    })
    .then(data =>{
        swal({
            icon:"success",
            text: "Sign in successfully",
            className: "sweetBox"
          }).then(()=>{
            window.open("/static/html_folder/log_in.html","_parent")
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


phoneCode.addEventListener('change',running)
submit.addEventListener('click',submitting)
changing.addEventListener('change',myfunc)
