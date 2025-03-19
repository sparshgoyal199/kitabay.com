let header = document.querySelector('.header')
let struct;
let f = document.querySelector('.submitss')
let e = document.querySelector('.selections')
let forBack = 1
let first_data = document.querySelector('.selections').value
let checks = 0
let valid = 1
let inputting = document.querySelectorAll(".adjust")
let complete = false;
let showData;
let getData;
let getRecords;
let lock = false;
let seacrhBarLength;

//for validating hand-to-hand input field
let submits = document.querySelector(".submitss")
let totalRecords = 0;
//above variable is created for already calculating the total number of vale its value will be taken from the get_data function and its value will be fixed already

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


function forward(event){
    if (forBack != 50) {
        forBack += 1
        event.target.previousElementSibling.textContent = `${forBack} of 50`
        //above representing which page i am on in now
        first_data = document.querySelector('.selections').value
        //first_data how many data to be brought
        let deletes = document.querySelector('.row_append')
        let count2 = deletes.children.length - 1;
        
        while (count2 != -1) {
            deletes.children[count2].remove()
            count2 -= 1;
        }
        let filter = document.querySelector('.hoverFocus').textContent
        get_data(first_data,forBack,filter)
        document.querySelector('.inp').value = ''
        //to clear the search bar
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
//this funtiion is running when we click on how many records to bring

function get_data(limit,page,filter){
    fetch(`/table_data/${limit}/${page}/${filter}`).
    then(res => {
        if (!res.ok) {
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            }) 
        }
        return res.json()}
)
    .then(data =>{
        getData = data[0]
        getRecords = data[1]
        loadingFilling(data[0],data[1],limit,page)      
        totalRecords = data[1];
    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
};
//get_data bringing the data from the backend then this data is being shown to ui through loadinfilling

function loadingFilling(data,records,limit,page,search = 1){
    let deletes = document.querySelector('.row_append')
        //to delete the exisiting data
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
        //if we are showing the records through searching
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
        d[1].textContent = i['product_id']
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
//loading filling is just showing the data to ui

window.onload = ()=>{
    get_data(5,1,"sort by");
}

function hiding(e){
    if(e.target.className != 'info_extract' && !document.querySelector('.info_extract').contains(e.target)){
        removing()
        //document.querySelector('.info_extract').style.display = 'none'
        document.querySelector('.body').removeEventListener('click',hiding)
    }
}

function setNull(){
    let form_arr = document.querySelector('.product_info')
    for (const element of form_arr) {
        if (element.className != 'submitss') {
            element.value = '';
        }
    }
}

function uploads(event){ 
    document.querySelector('.info_extract').style.display = 'flex'
    //existing form is opening
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
        //picking that row when click on edit
        removeAtrributes(struct);     
        f.addEventListener('click',editing)
    }
    setTimeout(()=>{
        document.querySelector('.body').addEventListener('click',hiding);
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
        //isNaN checking it is the valid number or not
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
    //to remove the form
    let buttons = document.querySelectorAll('button,a,.books,.dropy,.all')
    
    buttons.forEach(e => {
        if (e.className != 'submitss') {
            e.style.pointerEvents = 'auto'
        }
    });

    let magic = document.querySelectorAll('main > *,header');
    //main > *,that means pick all the childerns of the main tag
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
            //how to interpret above by select that td in struct which is which name is equals to e.nextelementsibling.name
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
        //so that 'red star' can be hide'
    })
}


function deleting(event){
    event.preventDefault();
    let d = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
    //d is representing whole product row
    let g = d.children[1].textContent
    //g is representing the product id
    d.remove();
    fetch(`/deleting/${g}`,{
        method:'DELETE'
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            })  
        }
        return res.json()
    }
)
    .then(data =>{
        location.reload();
    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}
//above funtion is helping in deleting the record

//this is for edit and delete the content of the row
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
    //it is used to stop the default action and it is not necessary that every event will have the default actionm
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var dateTime = date;
    //this above is very important as it does not implement the required attribute in input tag as we have run the remove_attribute function dont take it as that it simplies pick up the html input tags
    //but the same story would be different in upload button because it is not in the flow

    let form_data = document.querySelector('.product_info')
    let forms = new FormData()
    forms.append("time",dateTime)
    forms.append('old',struct.querySelector('[name=products_id]').textContent)
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
                //above func is filling the feild if the feild value is empty btw field value will be always filled but if the user empties the field then this will ensure no empty value
            }
            validating(i.name,i.value);
            forms.append(`${i.name}`,i.value)  
        }
        if (valid == 0) {
            valid = 1;
            //DisplayingErrors(check_errors,form_data);
            check_errors = {}
            checks = 0;
            return ;
        }
    }
    
    if (!navigator.onLine) {
        alert('You are offline. Please check your internet connection.');
        return;
    }
    fetch(`/updating2${t}`,{
        method:'PUT',
        body:forms
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
        f.removeEventListener('click',editing)
        removing();
        t = 0
        location.reload()
    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

function submittings(e){
    e.preventDefault();
    var today = new Date();
    //it is used to stop the default action and it is not necessary that every event will have the default action
    var date = today.getFullYear()+'-'+today.getMonth()+1+'-'+today.getDate();
    var dateTime = date;
    let form_data = document.querySelector('.product_info')
    if (!form_data.reportValidity()) {
        return ;
    }

    let forms = new FormData()
    forms.append("time",dateTime)
    //specifically designed for handling form data, especially when dealing with file uploads and complex form submissions 
    for (const i of form_data) {
        //speciality here is that it only picks the input tag
        if (i.name) {
            //i.name is here so that we cant choose button tag
            if (i.name == 'image') {
                validating(i.name,i.files[0])
                forms.append(`${i.name}`,i.files[0])
                }  
            else{
                validating(i.name,i.value);
                forms.append(`${i.name}`,i.value)  
                /*input tag name and backend table name should be match */
                //i.value is used to denote the value of input tag
                //.name is used to denote the name of input tag 
            }
            if (valid == 0) {
                valid = 1;
                //DisplayingErrors(check_errors,form_data);
                check_errors = {}
                checks = 0;
                return ;
            }
            //now this whole checks the custom validating
        }
    }
    // if (!navigator.onLine) {
    //     alert('You are offline. Please check your internet connection.');
    //     return;
    // }
    fetch('/uploading2',{
        method:'POST',
        body:forms
    })
    .then(res => {
        if (!res.ok) {
            //res.text is itself a promise response is the result of promise
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
                //response.substring for customising the format of error send by the backend
            })  
        }
        //we can also show the customise error message into frontend
        return res.json()
        //first of all convert the content of backend into json format
    })
    .then(data =>{  
        f.removeEventListener('click',submittings)
        alert('data added successfully')
        location.reload();
        //here we cant write swal function as it is asynchr code(which runs always in last) and our page is loading automatically page loading prevent running of async code that's why simple alert here
    })
    .catch(e => {
        swal.fire({
            icon:"error",
            text: `${e}`,
            className: "sweetBox"
          })
    })
}

function searching(event){    
    let f = document.querySelector('.hoverFocus').textContent
    //f representing the filter value which filter is going on
    let searched = event.target.value
    seacrhBarLength = searched.length
    //these line will always remain common because we need to when the user is cutting down the word to less than 3 then we need to remove the existing ui data and then show the existing ui data which is first 5 records
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
            fetch(`/searching/${searched}`)
        .then(res => {
            if (!res.ok) {
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
    //cant run removing here because it include extra things
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
    //i represents the product id
    
    fetch(`/gettingImage/${i}`).
    then(res => {
        if (!res.ok) {
            return res.text().then(response => {
                throw new Error(response.substring(11,response.length-2))
            })   
        }
        return res.json()}
).then(data => { 
    document.querySelector('.static_image').src = `${data}`
    //data reprsents file global path
}).catch(e => {
    swal.fire({
        icon:"error",
        text: `${e}`,
        className: "sweetBox"
      })
})
    
}

function ErrorImage(event){
    event.target.src = '/static/image/image_error.webp'
    //this is our image which is shown when image is not found in the system
}

function closes(event){
    document.querySelector('.static_image').src = ""
    document.querySelector('.static_image').removeEventListener('error',ErrorImage)
    document.querySelector('.closed').className += " invisible"
    removing();
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
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
    //parTag representing the current filter value
    parTag.textContent = `sort by: ${event.target.textContent}`
        
    first_data = document.querySelector('.selections').value
    //first_data representing limit
    get_data(first_data,forBack,parTag.textContent)
}
//addition is running when we click oon filter the data
//this function is special as it is filtering that data which is being shown by the page and limit
inputting.forEach(e =>{
    e.addEventListener('input',inputValidating)
})

e.addEventListener('change',bringing)
document.querySelector('.static_image').addEventListener('error',ErrorImage)
    //The error event is triggered when there is an issue with loading the resource (e.g., an image fails to load)
