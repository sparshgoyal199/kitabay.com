let header = document.querySelector('.header')
let image;
let photo = document.querySelector('#user_photo')
let image_tag = document.querySelector('.image')
let product_submit = document.querySelector('.submit')
let width_changes = document.querySelectorAll('.itemss')
let targets;

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

$(document).ready(function () {
    var itemsMainDiv = ('.MultiCarousel');
    var itemsDiv = ('.MultiCarousel-inner');
    var itemWidth = "";

    $('.leftLst, .rightLst').click(function () {
        var condition = $(this).hasClass("leftLst");
        if (condition)
            click(0, this);
        else
            click(1, this)
    });

    ResCarouselSize();




    $(window).resize(function () {
        ResCarouselSize();
    });

    //this function define the size of the items
    function ResCarouselSize() {
        var incno = 0;
        var dataItems = ("data-items");
        var itemClass = ('.item');
        var id = 0;
        var btnParentSb = '';
        var itemsSplit = '';
        var sampwidth = $(itemsMainDiv).width();
        var bodyWidth = $('body').width();
        $(itemsDiv).each(function () {
            id = id + 1;
            var itemNumbers = $(this).find(itemClass).length;
            btnParentSb = $(this).parent().attr(dataItems);
            itemsSplit = btnParentSb.split(',');
            $(this).parent().attr("id", "MultiCarousel" + id);


            if (bodyWidth >= 1200) {
                incno = itemsSplit[3];
                itemWidth = sampwidth / incno;
            }
            else if (bodyWidth >= 992) {
                incno = itemsSplit[2];
                itemWidth = sampwidth / incno;
            }
            else if (bodyWidth >= 768) {
                incno = itemsSplit[1];
                itemWidth = sampwidth / incno;
            }
            else {
                incno = itemsSplit[0];
                itemWidth = sampwidth / incno;
            }
            $(this).css({ 'transform': 'translateX(0px)', 'width': itemWidth * itemNumbers });
            $(this).find(itemClass).each(function () {
                $(this).outerWidth(itemWidth);
            });

            $(".leftLst").addClass("over");
            $(".rightLst").removeClass("over");

        });
    }


    //this function used to move the items
    function ResCarousel(e, el, s) {
        var leftBtn = ('.leftLst');
        var rightBtn = ('.rightLst');
        var translateXval = '';
        var divStyle = $(el + ' ' + itemsDiv).css('transform');
        var values = divStyle.match(/-?[\d\.]+/g);
        var xds = Math.abs(values[4]);
        if (e == 0) {
            translateXval = parseInt(xds) - parseInt(itemWidth * s);
            $(el + ' ' + rightBtn).removeClass("over");

            if (translateXval <= itemWidth / 2) {
                translateXval = 0;
                $(el + ' ' + leftBtn).addClass("over");
            }
        }
        else if (e == 1) {
            var itemsCondition = $(el).find(itemsDiv).width() - $(el).width();
            translateXval = parseInt(xds) + parseInt(itemWidth * s);
            $(el + ' ' + leftBtn).removeClass("over");

            if (translateXval >= itemsCondition - itemWidth / 2) {
                translateXval = itemsCondition;
                $(el + ' ' + rightBtn).addClass("over");
            }
        }
        $(el + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
    }

    //It is used to get some elements from btn
    function click(ell, ee) {
        var Parent = "#" + $(ee).parent().attr("id");
        var slide = $(Parent).attr("data-slide");
        ResCarousel(ell, Parent, slide);
    }

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
    t.className = 'item'
    t.innerHTML = `<div class="pad16" style="width:15vw;" >
                        <button onclick="adding(event)" ><img src="/image/plus.png" class="plus" ></button>
                        <button onclick="adding(event)">ADD PRODUCT</button>
                    </div>`
    document.querySelector('.MultiCarousel-inner').appendChild(t)
}

width_changes.forEach((ele) => {
    ele.style.width = `${11}vw`
});



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
        })

        removing();
        remove_tag.children[0].remove();
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


