let header = document.querySelector('.header')
let image;
let photo = document.querySelector('#user_photo')
let image_tag = document.querySelector('.image')
let product_submit = document.querySelector('.submit')
let width_changes = document.querySelectorAll('.itemss')
let right = document.querySelector('.rightLst')
let targets;
let storage_blocks = []

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

$(document).ready(function(){
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
    });
});

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
    let count = 6
    let attack = document.querySelector('.slick-track')
    /*if (JSON.parse(localStorage.getItem('storage'))) {
        for (let e of JSON.parse(localStorage.getItem('storage'))) {
        }
    }*/
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
        for (let i in data) { 
            let g = document.createElement('div')
            g.innerHTML = localStorage.getItem('structure') 
            g.children[0].children[0].children[0].children[0].children[0].innerHTML = data[i][7]
            let inners = g.children[0].children[0].children[1]
            console.log(data[i][1]);
            
            inners.children[2].innerHTML = data[i][1]
            inners.children[3].innerHTML = data[i][2]
            inners.children[4].children[0].innerHTML = data[i][4]
            inners.children[4].children[1].innerHTML = data[i][5]
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
                attack.children[count].children[0].children[0].innerHTML = g.innerHTML;
                attack.children[count].children[0].children[0].style.width = `${85}%`
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
})
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

function adding(event){
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
    targets = event.target 
    
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

function adds(event){
    let t = document.createElement('div')
    t.className = "slick-slide slick-cloned slick-active"
    t.innerHTML = `<div class="pad16" style="width:15vw;" >
                        <button onclick="adding(event)" ><img src="/image/plus.png" class="plus" ></button>
                        <button onclick="adding(event)">ADD PRODUCT</button>
                    </div>`
    document.querySelector('.slick-track').appendChild(t)
}



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
            remove_tag.innerHTML = `<div class="itemss" style="background-color: #fbf9f9; padding: 0px 7px;" >
    <div class="pad15">
        <div class="discount">
            <div class="styling">
                <span>${form_data['discount'].value}</span>
            </div>
        </div>
        <div class="things">
           <img class="photos" src=${image_page} >
           <button class="updates">Update</button>
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
            
        localStorage.setItem("structure",`<div class="itemss" style="background-color: #fbf9f9; padding: 0px 7px;" >
                <div class="pad15">
                    <div class="discount">
                        <div class="styling">
                            <span></span>
                        </div>
                    </div>
                    <div class="things">
                       <img class="photos">
                       <button class="updates">Update</button>
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

photo.addEventListener('change',changing)
product_submit.addEventListener('click',storing)

