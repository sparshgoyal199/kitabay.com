let header = document.querySelector('.header')
let struct;
let f = document.querySelector('.submitss')
let e = document.querySelector('.selections')
let forBack = 1
let first_data = document.querySelector('.selections').value
let checks = 0
let valid = 0
let inputting = document.querySelectorAll(".adjust")
let complete = false;
let showData;
let getData;
let getRecords;
let lock = false;
let lock2 = false;
let seacrhBarLength;
let bookToId = new Map();
let submits = document.querySelector(".submitss")
let totalRecords = 0;
let google_id;
if (!navigator.onLine) {  
    alert('You are offline. Please check your internet connection.');
}

(function automatic(){
    fetch('/static/html_folder/index.html')
    .then(res => {
        if (!res.ok) {
            throw new Error(res)
        }
        return res.text()
    })
    .then((data) => 
        {
        header.innerHTML = data; 
        document.querySelector('.logo').parentNode.style.pointerEvents = 'none'
        document.querySelector('.inp').addEventListener('input',searching)
        }
    )
    .catch(error => {
        console.log('some error occured');
        header.innerHTML = 'Some error occured'
    })
})();

const BASE_URL = (window.location.hostname.toString() === '127.0.0.1') ? 'http://localhost:80' : 'https://kitabay-com-455z.onrender.com'

function forward(event){
    if (forBack != 50) {
        forBack += 1
        event.target.previousElementSibling.textContent = `${forBack} of 50`
        first_data = document.querySelector('.selections').value
        let deletes = document.querySelector('.row_append')
        let count2 = deletes.children.length - 1;
        
        while (count2 != -1) {
            deletes.children[count2].remove()
            count2 -= 1;
        }
        let filter = document.querySelector('.hoverFocus').textContent
        get_data(first_data,forBack,filter)
        document.querySelector('.inp').value = ''
    }
}

function backward(event){
    if (forBack != 1) {
        forBack -= 1
        event.target.nextElementSibling.textContent = `${forBack} of 50`
        first_data = document.querySelector('.selections').value
        let deletes = document.querySelector('.row_append')
        let count2 = deletes.children.length - 1;
        
        while (count2 != -1) {
            deletes.children[count2].remove()
            count2 -= 1;
        }
        let filter = document.querySelector('.hoverFocus').textContent
        get_data(first_data,forBack,filter)
        document.querySelector('.inp').value = ''
    }
}

function bringing(event){
    let first = event.target.value;
    let deletes = event.target.parentNode.parentNode.parentNode.nextElementSibling.nextElementSibling
    let count2 = deletes.children.length - 1;
    
    while (count2 != -1) {
        deletes.children[count2].remove()
        count2 -= 1;
    }
    let filter = document.querySelector('.hoverFocus').textContent
    get_data(first,forBack,filter)
    document.querySelector('.inp').value = ''
}

function get_data(limit,page,filter){
    let has_authenticated = true
    fetch(`${BASE_URL}/table_data/${limit}/${page}/${filter}`,{
        headers: {
            "Authorization":'Bearer ' + localStorage.getItem("token")
          }
    }).
    then(res => {
        if (!res.ok) {      
            if (res.status == 401) {
                has_authenticated = false    
            }      
                return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            }) 
        }
        return res.json()}
)
    .then(data =>{
        getData = data[0]
        console.log(getData);
        getRecords = data[1]
        loadingFilling(data[0],data[1],limit,page)      
        totalRecords = data[1];
    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          }).then(()=>{
            if (!has_authenticated) {
                window.open("/static/html_folder/log_in.html", "_parent");
              }
          })
    }
    
)
};

function loadingFilling(data,records,limit,page,search = 1){
    let deletes = document.querySelector('.row_append')
    let count2 = deletes.children.length - 1;
    while (count2 != -1) {
        deletes.children[count2].remove()
        count2 -= 1;
    }
    let z
    
    if(search == 1){
        z = limit*(page-1) + 1 
    }
    else{
        z = 1;
    }
    for (const i of data) {      
        let row = document.createElement('tr')
        row.className = 'rows group'
        row.innerHTML = `<th class="text-[2.4vh]" scope="row" name="id"></th>
                    <td class="text-[2.4vh] hidden" name="products_id"></td>
                    <td class="text-[2.4vh]" name="name"></td>
                    <td class="text-[2.4vh]" name="author"></td>
                    <td class="text-[2.4vh]" name="price" >
                        <span></span>
                        <sub class="text-[2.1vh] font-medium subscript"></sub>
                    </td>
                    <td class="text-[2.4vh]" name="s_price" style="padding-left:15px;"></td>
                    <td name="star">
                        <div class="colorings"><span style="margin-top: 1.35px;" >${parseFloat(i['star']).toFixed(1)}</span><span>⭐</span></div> 
                    </td>
                    <td class="text-[2.4vh]" style="padding-left:19px;" name="quantity"></td>
                    
                    <td class="text-[2.4vh]"></td>
                    <td class="text-[2.4vh]">
        
                      <div class="btn-group dropstart">
                        <button type="button" class="dots group-hover:visible" data-bs-toggle="dropdown" aria-expanded="false">
                          ...
                        </button>
                        <ul class="dropdown-menu">
                          <!-- Dropdown menu links -->
                          <li><button class="dropdown-item text-[2.4vh]" onclick="uploads(event)">Edit Data</button></li>
                          <li><button class="dropdown-item text-[2.4vh]" onclick="deleting(event)">Delete Data</button></li>
                          <li><button class="dropdown-item text-[2.5vh]" onclick="viewing(event)">view image</button></li>
                        </ul>
                      </div>
                    </td>`
        let d = row.children
        d[0].textContent = z;
        d[1].textContent = i['id']
        d[2].textContent = i['name']
        d[3].textContent = i['author']
        d[4].children[0].textContent = `₹${i['price']}`
        d[4].children[1].textContent = `(${i['discount']}%)`
        d[5].textContent = `₹${i['s_price']}`
        d[7].textContent = i['quantity']
        d[8].textContent = i['time']
        document.querySelector('.row_append').appendChild(row)
        z += 1
    }
    document.querySelector('.state').textContent = `Results:${limit*(page-1) + 1} - ${parseInt(limit*page)} of ${records}`
}

window.onload = ()=>{
    get_data(5,1,"sort by");
}

function hiding(e){
    if(e.target.className != 'info_extract' && !document.querySelector('.info_extract').contains(e.target) && e.target.className != 'swal2-confirm swal2-styled'){
        removing()
        document.querySelector('.body').removeEventListener('click',hiding)
    }
}

function setNull(){
    let form_arr = document.querySelector('.product_info')
    for (const element of form_arr) {
        if (element.className != 'submitss' && element.className != 'product_image') {
            element.parentNode.nextElementSibling.textContent = '';
            element.value = '';
        }
    }
}

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
    if (event.target.className == 'uploads text-[2.4vh] w-[5.3vw] h-[5.2vh] rounded-[2vh]') {
        f.addEventListener('click',submittings)
        setNull();
    }
    else{
        struct = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
        removeAtrributes(struct);     
        document.getElementById('AuthIdentity').disabled = true
        document.getElementById('BookNames').disabled = true
        valid = 1
        f.addEventListener('click',editing)
    }
    setTimeout(()=>{
        document.querySelector('.body').addEventListener('click',hiding)
        //**if i dont write in the set-timeout then it is mysterious that hiding function will automatically */
    },1)
}

function inputValidating(e){
    let i = e.target.value
    let n = e.target.parentNode.nextElementSibling
    if (e.target.name == "star") {
        if (0 <= parseFloat(i) && parseFloat(i) <= 5){
            n.textContent = ""
        }
        else{
            n.textContent = 'Ratings should be between 0 to 5'
        }
    }
    else if (e.target.name == "discount") {
        if (0 < parseFloat(i)){
            n.textContent = ""
        }
        else{
            n.textContent = 'Discount value should be valid number'
        }
    }
    else if (e.target.name == "quantity") {
        if (0 < parseFloat(i)){
            n.textContent = ""
        }
        else{
            n.textContent = 'Quantity value should be valid number'
        }
    }
    else if (e.target.name == "price") {
        if (0 < parseFloat(i)){
            n.textContent = ""
        }
        else{
            n.textContent = 'Price value should be valid number'
        }
    }
    else if (e.target.name == "s_price") {
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
    else if(a == "price"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
        }
    }
    else if(a == "s_price"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
        }
    }
    else if(a == "quantity"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
        }
    }
    else if(a == "discount"){
        if (isNaN(parseFloat(b))  || !parseFloat(b) > 0) {
            checks += 1;
        }
    }
    else if(a == "image"){
        if(b.size >= 1048576){
            checks += 1;
            swal({
                icon:"error",
                text: 'image size should be less than 1 MB',
                className: "sweetBox"
              })
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
    document.querySelector('.product_image').removeAttribute("required")
    rem.forEach(e => {
        let a
        e.nextElementSibling.removeAttribute("required")
        if (e.nextElementSibling.name == 'star') {
            a = struct.querySelector(`[name=${e.nextElementSibling.name}]`).children[0].children[0].textContent
        }
        if (e.nextElementSibling.name == 'author' || e.nextElementSibling.name == 'name' || e.nextElementSibling.name == 'quantity') {
            a = struct.querySelector(`[name=${e.nextElementSibling.name}]`).textContent
        }
        if (e.nextElementSibling.name == 'price') {
            a = struct.querySelector(`[name=${e.nextElementSibling.name}]`).children[0].textContent
            a = a.substring(1,a.length)
        }
        
        if (e.nextElementSibling.name == 's_price') {
            a = struct.querySelector(`[name=${e.nextElementSibling.name}]`).textContent
            a = a.substring(1,a.length)
        }
        if (e.nextElementSibling.name == 'discount') {
            a = struct.querySelector(`[name=price]`).children[1].textContent
            a = a.substring(1,a.length-2)
        }
        
        e.nextElementSibling.value = a
        e.style.visibility = "hidden"
    })
}


function deleting(event){
    event.preventDefault();
    let d = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
    console.log(d);
    let g = d.children[1].textContent
    console.log(d.children[1]);
    
    d.remove();
    let has_authenticated = true
    fetch(`${BASE_URL}/deleting/${g}`,{
        headers: {
            "Authorization":'Bearer ' + localStorage.getItem("token")
          },
        method:'DELETE'
    })
    .then(res => {
        if (!res.ok) {
            if (res.status == 401) {
                has_authenticated = false    
            } 
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            })  
        }
        return res.json()
    }
)
    .then(data =>{
        swal.fire({
            icon:"success",
            text: 'row deleted successfully',
            className: "sweetBox"
        }).then(
            ()=>{
                location.reload()
            }
        )
    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          }).then(()=>{
            if (!has_authenticated) {
                window.open("/static/html_folder/log_in.html", "_parent");
              }
          })
    })
}

function emptyFeildFill(struct,i){
    let a = struct.querySelector(`[name=${i.name}]`)
    
    if (i.name == "price") {
        a = a.children[0].textContent
        i.value = a.substring(1,a.length)
    }
    else if (i.name == "star") {
        a = a.children[0].children[0].textContent
        i.value = a
    }
    else if (i.name == "s_price") {
        a = a.textContent
        i.value = a.substring(1,a.length)
    }
    else if (i.name == "discount") {
        a = struct.querySelector(`[name=price]`)
        discBrack = a.children[1].textContent
        a = discBrack.substring(1,discBrack.length-2)
        i.value = a
    }
    else{
        a = a.textContent
        i.value = a
    }
}

function editing(event){
    event.preventDefault();
    let t = 0
    let fo = document.querySelector('.product_info')
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var dateTime = date;

    let form_data = document.querySelector('.product_info')
    let forms = new FormData()
    forms.append("time",dateTime)
    forms.append('book_id',struct.querySelector('[name=products_id]').textContent)
    for (const i of form_data) { 
        if(i.name == "image"){
            if(i.files[0]){
                validating(i.name,i.files[0])
                forms.append(`${i.name}`,i.files[0])
                t = 1
            }
        }
        else if(i.className != 'submitss'){ 
            if (!i.value) {
                emptyFeildFill(struct,i)
            }
            validating(i.name,i.value);
            forms.append(`${i.name}`,i.value)  
        }
        if (valid == 0) {
            check_errors = {}
            checks = 0;
            return ;
        }
    }
    
    if (!navigator.onLine) {
        alert('You are offline. Please check your internet connection.');
        return;
    }
    let has_authenticated = true;
    fetch(`${BASE_URL}/update${t}`,{
        headers: {
            "Authorization":'Bearer ' + localStorage.getItem("token")
          },
        method:'PUT',
        body:forms
    })
    .then(res => { 
        if (!res.ok) {
            if (res.status == 401) {
                has_authenticated = false    
            }
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            }) 
        }
        return res.json()
    })
    .then(data =>{  
        f.removeEventListener('click',editing)
        removing();
        t = 0
        //location.reload()
        swal.fire({
            icon:"success",
            text: 'row updated successfully',
            className: "sweetBox"
        }).then(
            ()=>{
                location.reload()
            }
        )
    })
    .catch(e => {
        removing()
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          }).then(()=>{
            if (!has_authenticated) {
                window.open("/static/html_folder/log_in.html", "_parent");
              }
          })
    })
}

function submittings(e){
    e.preventDefault();
    var today = new Date();
    var date = today.getFullYear()+'-'+today.getMonth()+1+'-'+today.getDate();
    var dateTime = date;
    let form_data = document.querySelector('.product_info')
    if (!form_data.reportValidity()) {
        return ;
    }

    let forms = new FormData()
    forms.append("time",dateTime)
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
            if (valid == 0) {
                check_errors = {}
                checks = 0;
                return ;
            }
        }
    }
    forms.append('google_id',google_id)
    let has_authenticated = true
    fetch(`${BASE_URL}/upload`,{
        headers: {
            "Authorization":'Bearer ' + localStorage.getItem("token")
          },
        method:'POST',
        body:forms
    })
    .then(res => {
        if (!res.ok) {
            if (res.status == 401) {
                has_authenticated = false    
            }
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            })  
        }
        return res.json()
    })
    .then(data =>{  
        f.removeEventListener('click',submittings)
        alert('data added successfully')
        location.reload();
    })
    .catch(e => {
        removing()
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          }).then(()=>{
            if (!has_authenticated) {
                window.open("/static/html_folder/log_in.html", "_parent");
            }
          })
    })
}

function searching(event){    
    let f = document.querySelector('.hoverFocus').textContent
    let searched = event.target.value
    seacrhBarLength = searched.length
    if (searched.length < 3) {
        if (getData) {
            loadingFilling(getData,getRecords,document.querySelector('.selections').value,forBack)
        }
        else{
            get_data(document.querySelector('.selections').value,forBack,f,0);
        }
    }
    else{
        if(!lock) {
            let has_authenticated = true;
            fetch(`${BASE_URL}/searching/${searched}`,{
                headers: {
                    "Authorization":'Bearer ' + localStorage.getItem("token")
                  }
            })
        .then(res => {
            if (!res.ok) {
                if (res.status == 401) {
                    has_authenticated = false    
                }
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })
            }
            return res.json()
        }).then(data =>{   
            if (seacrhBarLength >= 3) {
                loadingFilling(data,totalRecords,document.querySelector('.selections').value,forBack,0)
            }
        }).catch(e => {
            swal.fire({
                icon:"error",
                text: `${e}`,
                className: "sweetBox"
              }).then(()=>{
                if (!has_authenticated) {
                    window.open("/static/html_folder/log_in.html", "_parent");
                }
              })
        })
        lock = true;
        setTimeout(()=>{
            lock = false;
        },500)
        }
    }
}


function viewing(event){
    let buttons = document.querySelectorAll('button,a,.books,.dropy,.all')
    buttons.forEach(e => {
        if (e.className != 'closed material-symbols-outlined text-red-600 mb-[-1.7vh] mr-[-1vh] z-2 invisible' && e.className != 'submitss') {
            e.style.pointerEvents = 'none'
        }
    });

    let magic = document.querySelectorAll('main > *,header');

    magic.forEach(e => {
        if (e.className != 'cross_image flex absolute top-[130px] z-1 flex-column items-end' && e.className != 'info_extract') {
            e.style.opacity = '0.6'
        }
    })
    document.querySelector('.inp').disabled = true
    document.querySelector('.closed').classList.remove('invisible')
    let i = event.target.parentNode.parentNode.parentNode.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent
    console.log(i);
    
    let has_authenticated = true;
    fetch(`${BASE_URL}/gettingImage/${i}`,{
        headers: {
            "Authorization":'Bearer ' + localStorage.getItem("token")
          }
    }).
    then(res => {
        if (!res.ok) {
            if (res.status == 401) {
                has_authenticated = false    
            }
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            })   
        }
        return res.json()}
).then(data => { 
    console.log(data);
    document.querySelector('.static_image').src = `${data}`
}).catch(e => {
    swal.fire({
        icon:"error",
        text: `${e}`,
        className: "sweetBox"
      }).then(()=>{
        if (!has_authenticated) {
            window.open("/static/html_folder/log_in.html", "_parent");
        }
      })
})
    
}

function ErrorImage(event){
    event.target.src = '/static/image/image_error.webp'
}

function closes(event){
    document.querySelector('.static_image').src = ""
    document.querySelector('.static_image').removeEventListener('error',ErrorImage)
    document.querySelector('.closed').className += " invisible"
    removing();
}

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}
  
window.onclick = function(event) {
    //document.querySelector('.body').addEventListener('click',hiding)
  if (!event.target.matches('.dropbtn')) {  
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function addition(event){
    let deletes = document.querySelector('.row_append')
    let count2 = deletes.children.length - 1;
    while (count2 != -1) {
        deletes.children[count2].remove()
        count2 -= 1;
    }
    let parTag = event.target.parentNode.previousElementSibling
    parTag.textContent = `sort by: ${event.target.textContent}`
        
    first_data = document.querySelector('.selections').value
    get_data(first_data,forBack,parTag.textContent)
}

function fillDataListOptions(data,dataList){
    bookToId.clear();
    data.items.forEach(function(x){
        if(!bookToId.has(x.volumeInfo.title)){
            let book_name = x.volumeInfo.title
            let optTag = document.createElement('option')
            optTag.textContent = book_name
            optTag.value = book_name
            dataList.append(optTag)
            bookToId.set(book_name,x.id);
        }
    })
}

function detAuthor(){
    document.getElementById('AuthIdentity').disabled = false
    document.getElementById('AuthIdentity').value = ''
    let kitab = document.getElementById('BookNames').value
    if (kitab) {
        fetch(`https://www.googleapis.com/books/v1/volumes/${bookToId.get(kitab)}`).
    then(res => {
        if (!res.ok) {
            if (res.status == 503) {
                throw new Error("Please choose valid book")
            } 
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            })   
        }
        return res.json()}
        ).then(data => { 
            google_id = data['id']
            if(!data['volumeInfo']['authors']){
                throw new Error("Please choose valid book")
            }
             data['volumeInfo']['authors'].forEach(function(x){
                if (document.getElementById('AuthIdentity').value) {
                    document.getElementById('AuthIdentity').value = document.getElementById('AuthIdentity').value +','+x;
                }
                else {
                    document.getElementById('AuthIdentity').value = x;
                }
             })
             document.getElementById('AuthIdentity').disabled = true
             document.getElementById('BookNames').parentNode.nextElementSibling.textContent = ''
             valid = 1;
        }).catch(e => {
            document.getElementById('BookNames').parentNode.nextElementSibling.textContent = 'Please enter valid book'
            swal.fire({
                icon:"error",
                text: `${e}`,
                className: "sweetBox"
              })
        })
    }
}

function fetchBookNames(event){
    if (event.target.value.length >= 3){
        let dataList = document.getElementById('brow')
        let bookName = event.target.value;
        if(!lock2){
            fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${bookName}&fields=items(id,volumeInfo/title)&key=AIzaSyBcGAHv0T-1oGKmHlWKbGtZBbK2NSLVFkI`).
        then(res => {
            if (!res.ok) {
                if (res.status == 401) {
                    throw new Error("error status 401")
                } 
                return res.text().then(response => {
                    throw new Error(response.substring(11,response.length-2))
                })   
            }
            return res.json()}
    ).then(data => { 
        fillDataListOptions(data,dataList)
    }).catch(e => {
        //removing();
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
    lock2 = true;
    setTimeout(()=>{
        dataList.innerHTML = ''
       lock2 = false;
    },500)
        }
    }
}
inputting.forEach(e =>{
    e.addEventListener('input',inputValidating)
})


e.addEventListener('change',bringing)
document.querySelector('.static_image').addEventListener('error',ErrorImage)