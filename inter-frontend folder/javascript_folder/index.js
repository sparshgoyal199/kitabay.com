
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
    if(a == 3){
        document.querySelector('.all').style.width = `${a + 1}vw`
        alert('hello')
        return ;
    }
    if(a == 5){
        document.querySelector('.all').style.width = `${a}vw`
        return ;
    }
    if(a == 6){
        document.querySelector('.all').style.width = `${a - 1}vw`
        return ;
    }
    if (a == 8 || a == 7) {
        document.querySelector('.all').style.width = `${a - 1.8}vw`
        return ;
    }
    if(a <= 10 && a > 6){
        document.querySelector('.all').style.width = `${a - 3}vw`
        return ;
    }
    if(a <= 14 && a > 10){
        document.querySelector('.all').style.width = `${a - 4.5}vw`
    }
    else{
        document.querySelector('.all').style.width = `${a - 7}vw`
    }
}

changing.addEventListener('change',myfunc)