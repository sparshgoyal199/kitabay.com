/*$(document).ready(function(){
  $('.center').slick({
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
          slidesToShow: 3
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
});*/

let a = [];
let d = document.querySelector('.div')
let e = document.querySelector('.div2')
d.innerHTML = `<h3>my name is sparsh</h3>`
e.innerHTML = '<h3>my name is rahil</h3>'
a.push(d.innerHTML);
a.push(e.innerHTML)
console.log(a.length);

