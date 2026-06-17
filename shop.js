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

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function getGroupedBasket() {
  const basket = getBasket();
  const grouped = {};
  
  // Count items by product type
  basket.forEach((product) => {
    grouped[product] = (grouped[product] || 0) + 1;
  });
  
  // Process bananas into bundles
  if (grouped.banana) {
    const bananaCount = grouped.banana;
    const bundles = Math.floor(bananaCount / 5);
    const remainder = bananaCount % 5;
    
    // Replace banana count with bundles and remainder
    if (bundles > 0) {
      grouped["banana-bundle"] = bundles;
    }
    if (remainder > 0) {
      grouped.banana = remainder;
    } else {
      delete grouped.banana;
    }
  }
  
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
  
  // Display grouped items
  Object.entries(grouped).forEach(([productKey, quantity]) => {
    const li = document.createElement("li");
    let displayName, emoji;
    
    if (productKey === "banana-bundle") {
      displayName = "Bundle of Bananas";
      emoji = "🍌";
    } else {
      const item = PRODUCTS[productKey];
      if (!item) return;
      displayName = item.name;
      emoji = item.emoji;
    }
    
    li.innerHTML = `<span class='basket-emoji'>${emoji}</span> <span>${quantity}x ${displayName}</span>`;
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

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
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
