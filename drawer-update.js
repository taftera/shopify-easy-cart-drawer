function cartUpdate() {
  fetch('/cart.js')
  .then((resp) => resp.json())
  .then((data) => {
    console.log('data', data);
    // Update cart items
    if(data.items.length > 0) {
      let drawerItems = document.getElementById('cart__drawer_items');
      // cleanse before adding new content
      drawerItems.innerHTML = null;
      data.items.forEach(product => {
        let div = document.createElement('div');
        div.classList.add('cart__drawer_item');
        let priceData;
        if(product.original_price !== product.line_price) {
          priceData = `
          <p>
            <span>${product.quantity} x </span>
            <span class="cart-item--sale-price money">${monify(product.original_price)}</span>
            <span class="money cart-item--discount-price">${monify(product.line_price)}</span>
          </p>
          <p class="item__discount">${saleTag} ${product.line_level_discount_allocations[0].discount_application.title} (-${monify(product.line_level_discount_allocations[0].amount)})</p>`;
        } else {
          priceData = `<p>${product.quantity} x ${monify(product.line_price)}</p>`;
        }
        div.innerHTML = `
          <div class="item__image">
            <img src="${product.featured_image.url}" alt="${product.featured_image.alt}">
          </div>
          <div class="item__details">
            <h5>${product.title}</h5>
            ${priceData}
          </div>
          <div class="item__remove" data-item-id="${product.variant_id}">×</div>
        `;
        drawerItems.appendChild(div);
      });
    } else {
      document.getElementById('cart__drawer_items').innerHTML = '<p>Cart is empty</p>';
      document.getElementById('cart__checkout_btn').setAttribute('disabled', 'disabled');
      document.getElementById('cart__checkout_btn').style.pointerEvents = 'none';
    }
    // Update total price
    document.getElementById('cart__total_price').innerHTML = monify(data.total_price);
    // Create currency view
    function monify(amount) {
      let currency = data.currency;
      let moneySymbol;
      if (currency == 'GBP') {
        moneySymbol = '£';
      } else if (currency == 'JPY') {
        moneySymbol = '¥';
      } else if (currency == 'EUR') {
        moneySymbol = '€';
      } else if (currency == 'BLR') {
        moneySymbol = 'R$';
      } else {
        //currency == 'USD' || currency == 'CAD'
        moneySymbol = '$';
      }
      let toMoney = amount * 0.01;
      return `${moneySymbol}${toMoney.toFixed(2)} ${currency}`;
    }
    // Update delete items form drawer and update counter
    let cartDeleteItems = document.querySelectorAll('#cart__drawer_items .cart__drawer_item .item__remove');
    let cartDeleteContainer = document.querySelectorAll('#cart__drawer_items .cart__drawer_item');
    cartDeleteItems.forEach((deleteBtn, index) => {
      deleteBtn.addEventListener('click', () => {
        let variantId = deleteBtn.dataset.itemId;
        let siteCounter = document.querySelector('.site-header-cart--count');
        siteCounter.dataset.headerCartCount = data.item_count - 1;
        //siteCounter.innerHTML = data.item_count - 1;
        $.ajax({
          type: "POST",
          url: "/cart/change.js",
          dataType: "json",
          data: {
            id: variantId,
            quantity: 0
          },
          success: function (success) {
            cartDeleteContainer[index].classList.add('cleared');
            // console.log('TL | DrawerDelete S', success);
            setTimeout(cartUpdate(), 750);
          },
          error: function (error) {
            console.log("ProPhotoSupply | DrawerDelete Error, please report it to support@monumental.is");
            console.log(JSON.stringify(error));
          }
        });
      })
    })
  });
}
cartUpdate();
function openDrawer() {
  document.querySelector('.site-header-cart--button').click()
}
let saleTag = '<svg class="icon-sale-tag " aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="350" height="350" viewBox="0 0 350 350" fill="none"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M0 197.826C0 192.95 1.93821 188.275 5.38762 184.83L179.459 10.7587C186.348 3.86966 195.692 -0.000356971 205.435 2.46966e-08H334.782C343.187 2.46966e-08 350 6.81304 350 15.2173V144.565C350 154.308 346.13 163.651 339.241 170.541L165.17 344.612C161.725 348.061 157.049 350 152.174 350C147.299 350 142.624 348.061 139.179 344.612L5.38762 210.821C1.93821 207.376 0 202.701 0 197.826ZM304.348 68.4786C304.348 81.085 294.128 91.3046 281.521 91.3046C268.915 91.3046 258.695 81.085 258.695 68.4786C258.695 55.8721 268.915 45.6525 281.521 45.6525C294.128 45.6525 304.348 55.8721 304.348 68.4786Z"></path></svg>';