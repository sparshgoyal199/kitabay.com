let header = document.querySelector('.header')
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

function uploads(event){
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
}

function storing(e){
    e.preventDefault();//it is used to stop the default action and it is not necessary that every event will have the default actionm
    let imageStore;
    let fo = document.querySelector('.product_info')
    if (!fo.reportValidity()) {
        return ;
    }

    let form_data = document.querySelector('.product_info')
    let forms = new FormData()
    for (const i of form_data) {
        if (i.name) {
            if (i.name == 'image') {
                validating(i.name,i.files[0])
                forms.append(`${i.name}`,i.files[0])
                }  
            else{
                validating(i.name,i.value);
                forms.append(`${i.name}`,i.value)   
            }
        }
    }
    if (valid == 0) {
        valid = 1;
        //DisplayingErrors(check_errors,form_data);
        check_errors = {}
        checks = 0;
        return ;
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
            remove_tag.className = 'removes'
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
           <div class="stars-outer">
                <div class="stars-inner"></div>
            </div>
            <div class="colorings"><span style="margin-top: 1.35px;" >${parseFloat(form_data['star'].value).toFixed(1)}</span><span>⭐</span></div> 
           <div class="prices">
               <span class="org">₹${form_data['price'].value}</span>
               <del class="slated">₹${form_data['s_price'].value}</del>
           </div>
        </div>
    </div>
 </div>`    
            
        document.querySelector('.removes  .stars-inner').style.width = `${Math.round((parseFloat(form_data['star'].value)/5)*100)}%`
        
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