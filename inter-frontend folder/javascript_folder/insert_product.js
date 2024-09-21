let header = document.querySelector('.header')
let f = document.querySelector('.submitss')
let struct;
let t = 0
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
let checks = 0
let valid = 1
let inputting = document.querySelectorAll(".adjust")
let submits = document.querySelector(".submitss")
localStorage.setItem("tableStruct",`
    <th scope="row" name="id"></th>
                    <td name="name"></td>
                    <td name="author"></td>
                    <td name="price"></td>
                    <td name="s_price"></td>
                    <td name="star"></td>
                    <td name="quantity"></td>
                    <td name="discount"></td>
                    <td name="image" class="truncate"></td>
                    <td></td>
                    <td>
        
                      <div class="btn-group dropstart">
                        <button type="button" class="dots group-hover:visible" data-bs-toggle="dropdown" aria-expanded="false">
                          ...
                        </button>
                        <ul class="dropdown-menu">
                          <!-- Dropdown menu links -->
                          <li><button class="dropdown-item" onclick="uploads(event)">Edit Data</button></li>
                          <li><button class="dropdown-item" onclick="deleting(event)">Delete Data</button></li>
                        </ul>
                      </div>
                    </td>`)
(function get_data(){
    
})()

function uploads(event){
    document.querySelector('.info_extract').style.display = 'flex'
    let buttons = document.querySelectorAll('button,a,.books,.dropy,.all')
    
    buttons.forEach(e => {
        if (e.className != 'submitss') {
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
    if (event.target.className == 'uploads') {
        f.addEventListener('click',submittings)
    }
    else{
        struct = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
        //pay attention on struct
        removeAtrributes(struct);     
        f.addEventListener('click',editing)
    }
}

function inputValidating(e){
    if (e.target.name == "star") {
        let i = e.target.value
        let n = e.target.parentNode.nextElementSibling

        if (0 <= parseFloat(i) && parseFloat(i) <= 5){
            n.textContent = ""
        }
        else{
            n.textContent = 'Ratings should be between 0 to 5'
        }
    }
    if (e.target.name == "discount") {
        let i = e.target.value
        let n = e.target.parentNode.nextElementSibling

        if (0 < parseFloat(i)){
            n.textContent = ""
        }
        else{
            n.textContent = 'Discount value should be valid number'
        }
    }
    if (e.target.name == "quantity") {
        let i = e.target.value
        let n = e.target.parentNode.nextElementSibling

        if (0 < parseFloat(i)){
            n.textContent = ""
        }
        else{
            n.textContent = 'Quantity value should be valid number'
        }
    }
    if (e.target.name == "price") {
        let i = e.target.value
        let n = e.target.parentNode.nextElementSibling

        if (0 < parseFloat(i)){
            n.textContent = ""
        }
        else{
            n.textContent = 'Price value should be valid number'
        }
    }
    if (e.target.name == "s_price") {
        let i = e.target.value
        let n = e.target.parentNode.nextElementSibling

        if (0 < parseFloat(i)){
            n.textContent = ""
        }
        else{
            n.textContent = 'Slated price value should be valid number'
        }
    }
}

function validating(a,b){
    if (a == "star") {
        if (isNaN(parseFloat(b)) || !(0 <= parseFloat(b) <= 5)) {
            checks += 1;        
        }
    }
    if(a == "price"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
            console.log("why p");
        }
    }
    if(a == "s_price"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
            console.log("why s_");
        }
    }
    if(a == "quantity"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
        }
    }
    if(a == "discount"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
        }
    }
    if (checks > 0) {
        valid = 0;
    }
}

function removing(){
    document.querySelector('.info_extract').style.display = 'none'
    let buttons = document.querySelectorAll('button,a,.books,.dropy,.all')
    
    buttons.forEach(e => {
        if (e.className != 'submitss') {
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

function removeAtrributes(struct){
    let rem = document.querySelectorAll('.redss')
    document.querySelector('.product_image').value = null
    document.querySelector('.product_image').removeAttribute("required")
    rem.forEach(e => {
        e.nextElementSibling.removeAttribute("required")
        let a = struct.querySelector(`[name=${e.nextElementSibling.name}]`).textContent
        if (e.nextElementSibling.name == 'price' || e.nextElementSibling.name == 's_price') {
            a = a.substring(1,a.length)
        }
        if (e.nextElementSibling.name == 'discount') {
            a = a.substring(0,a.length-1)
        }
        e.nextElementSibling.value = a
        e.style.visibility = "hidden"
    })
}

function value_setting(struct,form_data,dateTime,data){
    let d = struct.children
    if (data == "hello moto") {
        data = d[8].textContent
    }
    //d[0].textContent = c + 1;
    d[1].textContent = form_data['name'].value
    d[2].textContent = form_data['author'].value
    d[3].textContent = `₹${form_data['price'].value}`
    d[4].textContent = `₹${form_data['s_price'].value}`
    d[5].textContent = form_data['star'].value
    d[6].textContent = form_data['quantity'].value
    d[7].textContent = `${form_data['discount'].value}%`
    d[8].textContent = data
    d[9].textContent = dateTime
}

function deleting(event){
    event.preventDefault();
    let d = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
    let g = d.children[1].textContent
    d.remove();
    fetch(`http://127.0.0.1:8011/deleting/${g}`,{
        method:'DELETE'
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
        console.log("delete successfully");
    })
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

//this is for edit and delete the content of the row
function editing(event){
    event.preventDefault();
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
//it is used to stop the default action and it is not necessary that every event will have the default actionm
    let fo = document.querySelector('.product_info')
    //this above is very important as it does not implement the required attribute in input tag as we have run the remove_attribute function dont take it as that it simplies pick up the html input tags
    //but the same story would be different in upload button because it is not in the flow
  
    if (!fo.reportValidity()) {
        return ;
    }

    let form_data = document.querySelector('.product_info')
    let forms = new FormData()
    for (const i of form_data) {
        if (i.name) {
            if (i.name == 'image') {
                validating(i.name,i.files[0])
                if (i.files[0]) {
                    forms.append(`${i.name}`,i.files[0])
                    t = 1
                }
                }  
            else{
                if (!i.value) {
                    i.value = struct.querySelector(`[name=${i.name}]`).textContent
                }
                validating(i.name,i.value);
                forms.append(`${i.name}`,i.value)   
            }
        }
    }
    forms.append("time",dateTime)
    if (valid == 0) {
        valid = 1;
        //DisplayingErrors(check_errors,form_data);
        check_errors = {}
        checks = 0;
        console.log("this should not be run");
        return ;
    }
    forms.append('old',struct.querySelector('[name=name]').textContent)
    
    fetch(`http://127.0.0.1:8011/updating2${t}`,{
        method:'PUT',
        body:forms
    })
    .then(res => {
        if (!res.ok) {
            if (res.status == 422) {
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })    
            }
            if (res.status == 423) {
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
        value_setting(struct,form_data,dateTime,data)
        f.removeEventListener('click',editing)
        removing();
        t = 0
    })
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

function submittings(e){
    e.preventDefault();
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
//it is used to stop the default action and it is not necessary that every event will have the default actionm
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
    forms.append("time",dateTime)
    if (valid == 0) {
        valid = 1;
        //DisplayingErrors(check_errors,form_data);
        check_errors = {}
        checks = 0;
        return ;
    }

    fetch('http://127.0.0.1:8011/uploading2',{
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
            if (res.status == 423) {
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
        let row = document.createElement('tr')
        row.className = 'rows'
        row.className += ' group'
        row.innerHTML = `<th scope="row" name="id"></th>
                    <td name="name"></td>
                    <td name="author"></td>
                    <td name="price"></td>
                    <td name="s_price"></td>
                    <td name="star"></td>
                    <td name="quantity"></td>
                    <td name="discount"></td>
                    <td name="image" class="truncate"></td>
                    <td></td>
                    <td>
        
                      <div class="btn-group dropstart">
                        <button type="button" class="dots group-hover:visible" data-bs-toggle="dropdown" aria-expanded="false">
                          ...
                        </button>
                        <ul class="dropdown-menu">
                          <!-- Dropdown menu links -->
                          <li><button class="dropdown-item" onclick="uploads(event)">Edit Data</button></li>
                          <li><button class="dropdown-item" onclick="deleting(event)">Delete Data</button></li>
                        </ul>
                      </div>
                    </td>`
        let b = document.querySelector('.row_append').children  
        let c = b.length
        let d = row.children
        d[0].textContent = c + 1;
        d[1].textContent = form_data['name'].value
        d[2].textContent = form_data['author'].value
        d[3].textContent = `₹${form_data['price'].value}`
        d[4].textContent = `₹${form_data['s_price'].value}`
        d[5].textContent = form_data['star'].value
        d[6].textContent = form_data['quantity'].value
        d[7].textContent = `${form_data['discount'].value}%`
        d[8].textContent = data
        d[9].textContent = dateTime
        document.querySelector('.row_append').appendChild(row)
        removing();
        f.removeEventListener('click',submittings)
    })
    .catch(e => {
        swal({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

inputting.forEach(e =>{
    e.addEventListener('input',inputValidating)
})
//submits.addEventListener('click',submittings)