const product-list = document.querySelector("#product-list");





document.addEventListener("DOMContentLoaded", function() {
    eventListeners();
});

function eventListeners() {
    product-list.addEventListener("click", getDataElements);


}

function getDataElements(event) {
console.log(event.target.classList.contains("btn-add-cart"));
}