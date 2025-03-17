import { books } from './content.mjs';
let gonre = document.querySelector('.all')
for (const i of books) {
    let opt = document.createElement('option')
    opt.style.backgroundColor = 'white'
    opt.id = 'op'
    opt.style.fontSize = "2vh"
    opt.value = i
    opt.textContent = i
    gonre.append(opt)
}

let changing = document.querySelector('.all')

function myfunc(event){
    let a = event.target.value.length
    if(a <= 6){
        document.querySelector('.all').style.width = `${a+0.5}vw`
    }
    else if (a == 8 || a == 7) {
        document.querySelector('.all').style.width = `${a - 1.8}vw`
    }
    else if(a == 10 || a == 9){
        document.querySelector('.all').style.width = `${a - 2.5}vw`
    }
    else if(a <= 14 && a > 10){
        document.querySelector('.all').style.width = `${a - 4.5}vw`
    }
    else{
        document.querySelector('.all').style.width = `${a - 7}vw`
    }
}

changing.addEventListener('change',myfunc)