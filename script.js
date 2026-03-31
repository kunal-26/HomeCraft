const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanel = document.getElementById("adminPanel");

const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const productsDiv = document.getElementById("products");
const categoryCards = document.getElementById("categoryCards");

const imageFile = document.getElementById("imageFile");
const preview = document.getElementById("preview");

/* ADMIN LOGIN */

loginBtn.onclick=()=>{
const u=prompt("Username");
const p=prompt("Password");
if(u==="admin" && p==="1234"){
localStorage.setItem("admin","true");
location.reload();
}else alert("Wrong login");
};

logoutBtn.onclick=()=>{
localStorage.removeItem("admin");
location.reload();
};

function isAdmin(){
return localStorage.getItem("admin")==="true";
}

function checkAdmin(){
adminPanel.style.display=isAdmin()?"block":"none";
logoutBtn.style.display=isAdmin()?"inline":"none";
loginBtn.style.display=isAdmin()?"none":"inline";
}
checkAdmin();

/* DATA */

let products=JSON.parse(localStorage.getItem("products"))||[];
let categories=JSON.parse(localStorage.getItem("categories"))||[];

function save(){
localStorage.setItem("products",JSON.stringify(products));
localStorage.setItem("categories",JSON.stringify(categories));
}

/* IMAGE PREVIEW */

imageFile.onchange=()=>{
const reader=new FileReader();
reader.onload=e=>{
preview.innerHTML=`<img src="${e.target.result}" width="120">`;
};
reader.readAsDataURL(imageFile.files[0]);
};

/* ADD PRODUCT */

function addProduct(){

const name=nameInput.value;
const price=price.value;
const color=color.value;
const description=description.value;
const category=category.value;

const file=imageFile.files[0];
if(!file){alert("Upload image");return;}

const reader=new FileReader();

reader.onload=e=>{

const image=e.target.result;

products.push({name,price,color,description,category,image});

/* AUTO CATEGORY */
if(!categories.find(c=>c.name===category)){
categories.push({name:category,image});
}

save();
buildCategories();
renderProducts();

document.querySelectorAll("#adminPanel input, textarea")
.forEach(el=>el.value="");

preview.innerHTML="";
};

reader.readAsDataURL(file);
}

/* CATEGORY UI */

function buildCategories(){

categoryFilter.innerHTML=`<option value="all">All</option>`;
categoryCards.innerHTML="";

categories.forEach(c=>{

categoryFilter.innerHTML+=
`<option value="${c.name}">${c.name}</option>`;

categoryCards.innerHTML+=`
<div class="category-card">
<img src="${c.image}" onclick="filterCategory('${c.name}')">
<p>${c.name}</p>
</div>`;
});
}

function filterCategory(cat){
categoryFilter.value=cat;
renderProducts();
}

/* RENDER PRODUCTS */

function renderProducts(){

const s=(search.value||"").toLowerCase();
const cat=categoryFilter.value||"all";

productsDiv.innerHTML="";

products
.filter(p=>p.name.toLowerCase().includes(s)
&& (cat==="all"||p.category===cat))
.forEach(p=>{

productsDiv.innerHTML+=`
<div class="card">
<img src="${p.image}">
<h3>${p.name}</h3>
<p class="price">₹${p.price}</p>
<p>${p.description}</p>
<small>${p.color}</small>
</div>`;
});
}

search.oninput=renderProducts;
categoryFilter.onchange=renderProducts;

buildCategories();
renderProducts();
