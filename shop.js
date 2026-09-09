const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function setBasket(items) {
  localStorage.setItem("basket", JSON.stringify(items));
}

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  setBasket(basket);
}

function updateBasketQuantity(product, change) {
  const basket = getBasket();

  if (change > 0) {
    basket.push(product);
    setBasket(basket);
    renderBasket();
    renderBasketIndicator();
    return;
  }

  const productIndex = basket.lastIndexOf(product);
  if (productIndex === -1) {
    return;
  }

  basket.splice(productIndex, 1);
  setBasket(basket);
  renderBasket();
  renderBasketIndicator();
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function getGroupedBasket() {
  const basket = getBasket();
  const grouped = {};

  basket.forEach((product) => {
    grouped[product] = (grouped[product] || 0) + 1;
  });

  return grouped;
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");

  if (!basketList) return;

  basketList.innerHTML = "";

  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }

  const grouped = getGroupedBasket();

  Object.entries(grouped).forEach(([productKey, quantity]) => {
    const item = PRODUCTS[productKey];
    if (!item) return;

    const li = document.createElement("li");
    li.className = "basket-item";

    const itemRow = document.createElement("div");
    itemRow.className = "basket-item-row";

    const itemName = document.createElement("div");
    itemName.className = "basket-item-name";
    itemName.innerHTML = `<span class="basket-emoji">${item.emoji}</span><span>${item.name}</span>`;

    const quantityControls = document.createElement("div");
    quantityControls.className = "basket-quantity-controls";

    const plusButton = document.createElement("button");
    plusButton.type = "button";
    plusButton.className = "basket-quantity-btn";
    plusButton.setAttribute("aria-label", `Increase ${item.name} quantity`);
    plusButton.textContent = "+";
    plusButton.addEventListener("click", () => {
      updateBasketQuantity(productKey, 1);
    });

    const quantityValue = document.createElement("span");
    quantityValue.className = "basket-quantity";
    quantityValue.textContent = String(quantity);

    const minusButton = document.createElement("button");
    minusButton.type = "button";
    minusButton.className = "basket-quantity-btn";
    minusButton.setAttribute("aria-label", `Decrease ${item.name} quantity`);
    minusButton.textContent = "-";
    minusButton.addEventListener("click", () => {
      updateBasketQuantity(productKey, -1);
    });

    quantityControls.appendChild(plusButton);
    quantityControls.appendChild(quantityValue);
    quantityControls.appendChild(minusButton);

    itemRow.appendChild(itemName);
    itemRow.appendChild(quantityControls);
    li.appendChild(itemRow);
    basketList.appendChild(li);
  });

  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};

const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
