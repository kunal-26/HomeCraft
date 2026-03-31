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

/* ---------- FIREBASE DATA ---------- */

let products = [];
let categories = [];

/* ---------- IMAGE PREVIEW ---------- */

imageFile.onchange = () => {
    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML =
            `<img src="${e.target.result}" width="120">`;
    };
    reader.readAsDataURL(imageFile.files[0]);
};

/* ---------- ADD PRODUCT (FIREBASE) ---------- */

async function addProduct() {

    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const color = document.getElementById("color").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    const file = imageFile.files[0];

    if (!file) {
        alert("Upload image");
        return;
    }

    /* Upload image to Firebase Storage */
    const storageRef = storage
        .ref("products/" + Date.now() + "_" + file.name);

    await storageRef.put(file);

    const imageURL = await storageRef.getDownloadURL();

    const product = {
        name,
        price,
        color,
        description,
        category,
        image: imageURL
    };

    /* Save product */
    await db.collection("products").add(product);

    /* Auto category */
    const catSnap = await db.collection("categories")
        .where("name", "==", category)
        .get();

    if (catSnap.empty) {
        await db.collection("categories").add({
            name: category,
            image: imageURL
        });
    }

    clearForm();
    loadData();
}

/* ---------- CLEAR FORM ---------- */

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("color").value = "";
    document.getElementById("description").value = "";
    document.getElementById("category").value = "";
    imageFile.value = "";
    preview.innerHTML = "";
}

/* ---------- DELETE PRODUCT ---------- */

async function deleteProduct(id) {
    if (!confirm("Delete product?")) return;

    await db.collection("products").doc(id).delete();
    loadData();
}

/* ---------- DELETE CATEGORY ---------- */

async function deleteCategory(catName) {

    if (!confirm("Delete category and products?"))
        return;

    const prods = await db.collection("products")
        .where("category", "==", catName)
        .get();

    prods.forEach(doc =>
        db.collection("products").doc(doc.id).delete()
    );

    const cats = await db.collection("categories")
        .where("name", "==", catName)
        .get();

    cats.forEach(doc =>
        db.collection("categories").doc(doc.id).delete()
    );

    loadData();
}

/* ---------- LOAD DATA ---------- */

async function loadData() {

    products = [];
    categories = [];

    const prodSnap = await db.collection("products").get();
    prodSnap.forEach(doc =>
        products.push({ id: doc.id, ...doc.data() })
    );

    const catSnap = await db.collection("categories").get();
    catSnap.forEach(doc =>
        categories.push(doc.data())
    );

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

            ${isAdmin()
                ? `<button onclick="deleteCategory('${c.name}')">Delete</button>`
                : ""}
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
        .forEach(p => {

            productsDiv.innerHTML += `
            <div class="card">

                <img src="${p.image}">
                <h3>${p.name}</h3>
                <p class="price">₹${p.price}</p>
                <p>${p.description}</p>
                <small>${p.color}</small>

                ${isAdmin() ? `
                <button onclick="deleteProduct('${p.id}')">Delete</button>
                ` : ""}

            </div>`;
        });
}

search.oninput = renderProducts;
categoryFilter.onchange = renderProducts;

/* ---------- INIT ---------- */

loadData();
