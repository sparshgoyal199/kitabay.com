let header = document.querySelector('.header')
let image;
let photo = document.querySelector('#user_photo')
let image_tag = document.querySelector('.image')
let product_submit
let width_changes = document.querySelectorAll('.itemss')
let right = document.querySelector('.rightLst')
let targets;
let storage_blocks = [];
let posting;
let data = {}
let fileData
let e

if (!localStorage.getItem("structure")) {
    localStorage.setItem("structure",`<div class="itemss group" style="background-color: #fbf9f9; padding: 0px 7px;" >
        <div class="pad15">
            <div class="discount">
                <div class="styling">
                    <span></span>
                </div>
            </div>
            <div class="things">
               <img class="photos">
               <button onclick=adding(event) class="updates group-hover:visible">Update</button>
               <span class="book_name" >
                   </span>
               <span class="author_name" ></span>
               <div class="prices">
                   <span class="org">₹</span>
                   <del class="slated">₹</del>
               </div>
            </div>
        </div>
     </div>`)
}

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
}


function formObject(){
    //console.log(event.target.parentNode.children);
    const toDataURL = url => fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
     }))


//Here is code for converting "Base64" to javascript "File Object".***

    function dataURLtoFile(dataurl, filename) {
       var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
       bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
       while(n--){
       u8arr[n] = bstr.charCodeAt(n);
       }
       let t = new File([u8arr], filename, {type:mime});
       data['image'] = t
     return t
    }

    toDataURL(e.parentNode.children[0].src)
    .then(dataUrl => {
       fileData = dataURLtoFile(dataUrl, "imageName.jpg");
       data['discount'] = e.parentNode.previousElementSibling.children[0].children[0].textContent
       data['name'] = e.parentNode.children[2].textContent
       data['author'] = e.parentNode.children[3].textContent
       data['price'] = e.parentNode.children[4].children[0].textContent
       data['s_price'] = e.parentNode.children[4].children[1].textContent
     })
}


function adding(event){
    e = event.target
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
    
    if (event.target.className == "updates group-hover:visible") {
        if (document.querySelector('.submit')) {
            document.querySelector('.submit').className = "posting"
        }
        posting = document.querySelector('.posting')
        posting.addEventListener('click',updatings)
        formObject();
    }
    else{
        if (document.querySelector('.posting')) {
            document.querySelector('.posting').className = "submit"
        }
        product_submit = document.querySelector(".submit")
        product_submit.addEventListener('click',storing)
        targets = event.target 
    }
}


function removing(){
    document.querySelector('.info_extract').style.display = 'none'
    let buttons = document.querySelectorAll('button,a,.books,.dropy,.all')
    
    buttons.forEach(e => {
        if (e.className != 'submit') {
            e.style.pointerEvents = 'auto'
        }
    });

    let magic = document.querySelectorAll('main > *,header');
    magic.forEach(e => {
        if (e.className != 'info_extract') {
            e.style.opacity = '1'
        }
    })
    
    document.querySelector('.inp').disabled = false
}


setTimeout(function onloading(){
    
    image_tag.src = `${localStorage.getItem('user_pic')}`
    //let attack = document.querySelector('.slick-track')
    let attacks = document.querySelector('.centers')
    
    fetch('http://127.0.0.1:8011/card_details')
    .then(res => {
        if (!res.ok) {
            if (res.status == 422){
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
        let count = 0
        if (data) {
            for (let i in data) { 
                let g = document.createElement('div')
                g.innerHTML = localStorage.getItem('structure') 
                g.children[0].children[0].children[0].children[0].children[0].innerHTML = `${data[i][7]}%`
                let inners = g.children[0].children[0].children[1]
                inners.children[2].innerHTML = data[i][1]
                inners.children[3].innerHTML = data[i][2]
                inners.children[4].children[0].innerHTML = `₹${data[i][4]}`
                inners.children[4].children[1].innerHTML = `₹${data[i][5]}`
                fetch(`http://127.0.0.1:8011/get_image/${data[i][0]}`)
                .then(ress => {
                    if (!ress.ok) {
                        if (ress.status == 422){
                            return ress.text().then(response => {
                                throw new Error(response.substring(11,response.length-2))
                            })    
                        }
                        else{
                            throw new Error(ress)
                        }
                    }
                    return ress.blob()
                })
                .then(image =>{
                    let ready = URL.createObjectURL(image)
                    inners.children[0].src = ready
                    attacks.children[count].innerHTML = g.innerHTML
                    /*attack.children[count].children[0].children[0].children[0].remove();
                    attack.children[count].children[0].children[0].innerHTML = g.innerHTML;*/
                    //attack.children[count].children[0].children[0].style.width = `${85}%`
                    count += 1;
                    })
                .catch(e => {
                    swal({
                        icon:"error",
                        text: `${e}`,
                        className: "sweetBox"
                      })
                })
            }
        }
})
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
},100)


$(document).ready(setTimeout(function(){
    $('.centers').slick({
        centerMode: true,
        centerPadding: '60px',
        slidesToShow: 5,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              arrows: false,
              centerMode: true,
              centerPadding: '40px',
              slidesToShow: 4
            }
          },
          {
            breakpoint: 480,
            settings: {
              arrows: false,
              centerMode: true,
              centerPadding: '40px',
              slidesToShow: 1
            }
          }
        ]
      })
      let r = document.querySelectorAll('.slick-slide')
        r.forEach(e=>{
          e.children[0].children[0].style.width = '85%'
        })
},500));


function storing(e){
    let imageStore;
    e.preventDefault();
    let form_data = document.querySelector('.product_info').children
    let forms = new FormData()
    for (const i of form_data) {
        if (i.name) {
            if (i.name == 'image') {
                forms.append(`${i.name}`,i.files[0])
                }
        
            else{
                forms.append(`${i.name}`,i.value)        
            }
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
        let remove_tag
        if (targets.nodeName == 'BUTTON') {
            remove_tag = targets.parentNode.parentNode
        }
        else{
            remove_tag = targets.parentNode.parentNode.parentNode
        }

        let image_raw = form_data['image'].files[0];      
        let filereader = new FileReader()
        filereader.readAsDataURL(image_raw)
        let image_page;
        filereader.onload = ((event) => {
            image_page = event.target.result
            remove_tag.innerHTML = `<div class="itemss group" style="background-color: #fbf9f9; padding: 0px 7px;" >
    <div class="pad15">
        <div class="discount">
            <div class="styling">
                <span>${form_data['discount'].value}%</span>
            </div>
        </div>
        <div class="things">
           <img class="photos" src=${image_page} >
           <button onclick=adding(event) class="updates group-hover:visible">Update</button>
           <span class="book_name" >
               ${form_data['name'].value}</span>
           <span class="author_name" >${form_data['author'].value}</span>
           <div class="prices">
               <span class="org">₹${form_data['price'].value}</span>
               <del class="slated">₹${form_data['s_price'].value}</del>
           </div>
        </div>
    </div>
 </div>`
            
        
            
            /*if (JSON.parse(localStorage.getItem('storage'))) {
                storage_blocks = JSON.parse(localStorage.getItem('storage'))
            }
            storage_blocks.push(`${remove_tag.innerHTML}`)
            localStorage.setItem('storage',JSON.stringify(storage_blocks))*/
        })
        width_changes.forEach((ele) => {
            ele.style.width = `${11}vw`
        });
        
        removing();
        remove_tag.children[0].remove();
        remove_tag.style.width = `${85}%`
    })
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

function updatings(e){
    e.preventDefault();
    let imageStore;
    let form_data = document.querySelector('.product_info').children
    let formss = new FormData()
    for (let i of form_data) {
        if (i.name) {
            i.removeAttribute("required")
            if (i.name == 'image' && i.files[0]) {
                formss.append(`${i.name}`,i.files[0])
                }
        
            else{
                if (i.name == "quantity" || i.name == "star") {
                    if (!i.value) {
                    formss.append(`${i.name}`,0)
                    }
                }
                if (i.value) {
                formss.append(`${i.name}`,i.value)
                }        
            }
        }
    }
    formss.append('old',data['author'])
    
    /*for (let r in data) {
        if (!formss[r]) {
            console.log(formss[r]);
            formss.append(`${r}`,data[r])
        }
       if (!forms[r] && r == "image") {
            forms.append(`${r}`,data[r].files[0])
        }
    }   */
    
    fetch('http://127.0.0.1:8011/updating',{
        method:'PUT',
        body:formss
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
        removing();
        location.reload();
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


