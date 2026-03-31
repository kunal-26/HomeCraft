/* ---------- ELEMENTS ---------- */

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanel = document.getElementById("adminPanel");

const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const productsDiv = document.getElementById("products");
const categoryCards = document.getElementById("categoryCards");

const imageFile = document.getElementById("imageFile");
const preview = document.getElementById("preview");

/* ---------- ADMIN LOGIN ---------- */

loginBtn.onclick = () => {
    const u = prompt("Username");
    const p = prompt("Password");

    if (u === "admin" && p === "1234") {
        localStorage.setItem("admin", "true");
        location.reload();
    } else alert("Wrong login");
};

logoutBtn.onclick = () => {
    localStorage.removeItem("admin");
    location.reload();
};

function isAdmin() {
    return localStorage.getItem("admin") === "true";
}

function checkAdmin() {
    adminPanel.style.display = isAdmin() ? "block" : "none";
    logoutBtn.style.display = isAdmin() ? "inline" : "none";
    loginBtn.style.display = isAdmin() ? "none" : "inline";
}
checkAdmin();

/* ---------- DATA ---------- */

let products = JSON.parse(localStorage.getItem("products")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];

function save() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
}

/* ---------- IMAGE PREVIEW ---------- */

imageFile.onchange = function() {
    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML =
            `<img src="${e.target.result}" width="120">`;
    };
    reader.readAsDataURL(imageFile.files[0]);
};

/* ---------- ADD / EDIT PRODUCT ---------- */

let editIndex = null;

function addProduct() {

    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const color = document.getElementById("color").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    const file = imageFile.files[0];

    if (!file && editIndex === null) {
        alert("Upload image");
        return;
    }

    const reader = new FileReader();

    reader.onload = e => {

        const image = file ? e.target.result : products[editIndex].image;

        const data = {
            name,
            price,
            color,
            description,
            category,
            image
        };

        if (editIndex !== null)
            products[editIndex] = data;
        else
            products.push(data);

        /* AUTO CATEGORY */
        if (!categories.find(c => c.name === category)) {
            categories.push({ name: category, image });
        }

        save();
        buildCategories();
        renderProducts();

        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("color").value = "";
        document.getElementById("description").value = "";
        document.getElementById("category").value = "";
        imageFile.value = "";
        preview.innerHTML = "";

        editIndex = null;
    };

    if (file) reader.readAsDataURL(file);
    else reader.onload({});
}

/* ---------- DELETE PRODUCT ---------- */

function deleteProduct(i) {
    if (!confirm("Delete product?")) return;

    products.splice(i, 1);
    save();
    renderProducts();
}

/* ---------- EDIT PRODUCT ---------- */

function editProduct(i) {

    const p = products[i];

    document.getElementById("name").value = p.name;
    document.getElementById("price").value = p.price;
    document.getElementById("color").value = p.color;
    document.getElementById("description").value = p.description;
    document.getElementById("category").value = p.category;

    preview.innerHTML =
        `<img src="${p.image}" width="120">`;

    editIndex = i;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- DELETE CATEGORY ---------- */

function deleteCategory(catName) {

    if (!confirm("Delete category and its products?"))
        return;

    categories = categories.filter(c => c.name !== catName);
    products = products.filter(p => p.category !== catName);

    save();
    buildCategories();
    renderProducts();
}

/* ---------- CATEGORY UI ---------- */

function buildCategories() {

    categoryFilter.innerHTML =
        `<option value="all">All</option>`;

    categoryCards.innerHTML = "";

    categories.forEach(c => {

                categoryFilter.innerHTML +=
                    `<option value="${c.name}">${c.name}</option>`;

                categoryCards.innerHTML += `
      <div class="category-card">
        <img src="${c.image}"
        onclick="filterCategory('${c.name}')">

        <p>${c.name}</p>

        ${isAdmin() ?
        `<button onclick="deleteCategory('${c.name}')">
          Delete
        </button>` : ""}
      </div>`;
  });
}

function filterCategory(cat) {
  categoryFilter.value = cat;
  renderProducts();
}

/* ---------- RENDER PRODUCTS ---------- */

function renderProducts() {

  const s = (search.value || "").toLowerCase();
  const cat = categoryFilter.value || "all";

  productsDiv.innerHTML = "";

  products
    .filter(p =>
      p.name.toLowerCase().includes(s) &&
      (cat === "all" || p.category === cat)
    )
    .forEach((p, i) => {

      productsDiv.innerHTML += `
      <div class="card">

        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <p>${p.description}</p>
        <small>${p.color}</small>

        ${isAdmin() ? `
        <button onclick="editProduct(${i})">Edit</button>
        <button onclick="deleteProduct(${i})">Delete</button>
        ` : ""}

      </div>`;
    });
}

search.oninput = renderProducts;
categoryFilter.onchange = renderProducts;

/* ---------- INIT ---------- */

buildCategories();
renderProducts();