let header = document.querySelector('.header')
let image;
let photo = document.querySelector('#user_photo')
let image_tag = document.querySelector('.image')
let add = document.querySelector('.add_product')
let product_submit = document.querySelector('.submit')

fetch('/html_folder/index.html')
.then(res => {
    if (!res.ok) {
        throw new Error(res)
    }
    return res.text()
})
.then((data) => 
    {
    header.innerHTML = data;  
    }
)
.catch(error => {
    console.log('some error occured');
    header.innerHTML = 'Some error occured'
})

let change_target = document.querySelectorAll('.books')
for (const i of change_target) {
    i.childNodes[3].onclick = (event) => {
        i.childNodes[1].click();
}
}

function changing(event){
    file = event.target.files[0]
    let fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = ((event) => {
        localStorage.setItem('user_pic',event.target.result)
        image_tag.src = `${localStorage.getItem('user_pic')}`
    })
}

window.onload = () => {
    image_tag.src = `${localStorage.getItem('user_pic')}`
}

add.onclick = () => {
    document.querySelector('.info_extract').style.display = 'flex'
    let buttons = document.querySelectorAll('button,a,.books,.dropy,.all')
    
    buttons.forEach(e => {
        if (e.className != 'submit') {
            e.style.pointerEvents = 'none'
        }
    });

    let magic = document.querySelectorAll('main > *,header');
    magic.forEach(e => {
        if (e.className != 'info_extract') {
            e.style.opacity = '0.6'
        }
    })
    
    document.querySelector('.inp').disabled = true
}

function storing(e){
    e.preventDefault();
    let form_data = document.querySelector('.product_info').children
    const forms = new FormData()
    forms.append('a','sparsh')
    for (const i of form_data) {
        if (i.name) {
            forms.append(`${i.name}`,i.value) 
        }
    }
    fetch('http://127.0.0.1:8011/uploading',{
        method:'POST',
        body:forms
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
            text: "Log in successfully",
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

photo.addEventListener('change',changing)
product_submit.addEventListener('click',storing)


