// var popUp = document.querySelector(".pop-up");
// var back = document.querySelector(".pop-up__back");
// var modalButton = document.querySelector(".pop-up__button");

// function openPopUp() {
//   console.log("openPopUp");
//   popUp.classList.add("active");
//   back.classList.add("active");
// }
// modalButton.addEventListener("click", openPopUp);

function modal() {
  var modalButton = document.querySelector(".pop-up__button");
  var modal = document.querySelector(".modal");
  var modalClose = document.querySelector(".modal__close");
  modal.style.cssText = `
visibility: hidden;
display: flex;

opacity: 0; 
transition: opacity 0.3s ease-in-out;
`;
  function openModal() {
    modal.style.visibility = "visible";
    modal.style.opacity = 1;
  }

  const closeModal = () => {
    const target = event.target;
    if (target === modalClose || target === modal) {
      modal.style.opacity = 0;
      setTimeout(() => {
        modal.style.visibility = "hidden";
      }, 300);
    }
  };

  modalButton.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal);
}

function animationElem() {
  function onEntry(entry) {
    entry.forEach((change) => {
      if (change.isIntersecting) {
        change.target.classList.add("element-show");
      }
    });
  }

  let options = {
    threshold: [0.5],
  };
  let observer = new IntersectionObserver(onEntry, options);
  let elements = document.querySelectorAll(".element-animation");

  for (let elm of elements) {
    observer.observe(elm);
  }
}

function bg_menu() {
  document.addEventListener("DOMContentLoaded", function () {
    document
      .querySelector(".header__burger-btn")
      .addEventListener("click", function () {
        document.querySelector(".header").classList.toggle("open");
        console.log("menu_open");
        document.body.classList.toggle("noscroll");
      });
  });

  // Закрыть меню при нажатии на Esc
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Действие при клике
      document.querySelector(".header").classList.remove("open");
    }
  });

  // Закрыть меню при клике вне его
  document.querySelector(".menu").addEventListener("click", (event) => {
    event._isClickWithInMenu = true;
  });
  document
    .querySelector(".header__burger-btn")
    .addEventListener("click", (event) => {
      event._isClickWithInMenu = true;
    });
  document.body.addEventListener("click", (event) => {
    if (event._isClickWithInMenu) return;
    // Действие при клике
    document.querySelector(".header").classList.remove("open");
  });
}

bg_menu();
modal();
animationElem();
