let goalAmount = 0;
let bgColor = null;
let txtColor = null;

const cors_api_url = 'https://56ee5b24e3f3.ngrok.io';
async function doCORSRequest(options, printResult) {
  return new Promise((resolve, reject) => {
    var x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);

    x.onload = function() {
      printResult({
        method: options.method,
        url:  options.url,
        status: x.status,
        statusText: x.statusText,
        responseText: (x.responseText || '')
      });
      resolve();
    };

    x.onerror = function (error) {
        reject(error);
    }

    if (/^POST/i.test(options.method)) {
      x.setRequestHeader('Content-Type', 'application/json');
    }

    x.send(options.data);
  })
}


const a = async () => {
  const b = await fetch('https://4c35a43dd798.ngrok.io/api/getgoalamount', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "shopId": `${window.location.host}`,
    }),
  });

  const temp = await b.json();
  console.log(temp);
  return temp;
}

async function setShopGoal(obj) {
  //goalAmount = obj.responseText;
  // const ab = await obj.json();
  // console.log(ab);
  const temp = await a();
  console.log(temp);
  goalAmount = "100"
};

function valWithDecimal(val) {
  const valStr = val.toString();
  return valStr.slice(0, valStr.length-2) + "." + valStr.slice(valStr.length-2);
}

function getBarMessage(goalAmount, cartAmount) {
  goalAmount = parseFloat(goalAmount);
  cartAmount = parseFloat(cartAmount);

  if(cartAmount === 0) {
    return `Buy $${goalAmount} to get free shipping!`;
  }
  else if(goalAmount > cartAmount) {
    return `Only $${goalAmount-cartAmount} away from free shipping`;
  } else if(goalAmount <= cartAmount) {
    return `Congratulations! You have got free shipping`;
  }
}

function updateFreeShippingBar(goalAmount, cartAmount) {
  const barMessage = getBarMessage(goalAmount, cartAmount);
  if($('.free-shipping-bar').length) {
    $('.free-shipping-bar .text-container').text(barMessage);
  } else {
    setupFreeShippingBar(barMessage);
  }
}

function setupFreeShippingBar(message) {
   $('header').prepend(`<div class="free-shipping-bar-container"><div class="free-shipping-bar"><div class="text-container">${message}</div></div></div>`);

   $('.free-shipping-bar-container').css({
      "display": 'block',
      "color": 'inherit',
      "height": '44px'
   });

   $('.free-shipping-bar').css({
      "opacity": "1",
      "margin": "0px",
      "padding": "0px",
      "left": "0px",
      "height": "auto",
      "width": "100%",
      "z-index": "100000001",
      "position": "fixed",
      "top": "0px",
   });

   $('.free-shipping-bar .text-container').css({
      "text-align": "center",
      "margin": "0px",
      "margin-bottom": "0px",
      "padding": "12px 10px",
      "left": "0px",
      "height": "auto",
      "width": "100%",
      "box-sizing": "border-box",
      "border": "medium none",
      "background-color": "rgb(30, 30, 32)",
      "color": "rgb(242, 202, 128)",
      "font-size": "16px",
      "line-height": "20px",
      "font-family": "Helvetica",
   });

   $(".sticky").css("top", "44px");
}

async function getTotalCartValue() {
   const cartResponse = await fetch(`${window.location.origin}/cart.js`);
   if (cartResponse.ok) {
      const cartObj = await cartResponse.json();
      const totalCartValue = valWithDecimal(cartObj.original_total_price);
      return totalCartValue;
   } else {
      console.error(cartResponse.status);
   }
}

doCORSRequest({
  method: "post",
  url: "/api/getgoalamount",
  data: JSON.stringify({
    "shopId": `${window.location.host}`,
  })
}, setShopGoal).then(() => {
  getTotalCartValue().then(currCartAmount => {
    updateFreeShippingBar(goalAmount, currCartAmount);
  });
});

const open = window.XMLHttpRequest.prototype.open;

function openReplacement() {
  this.addEventListener("load", function () {
    if (
      [
      "/cart/add.js",
      "/cart/update.js",
      "/cart/change.js",
      "/cart/clear.js",
      ].includes(this._url)
    ) {
      calculateShipping(this.response);
    }
  });

  return open.apply(this, arguments);
}

window.XMLHttpRequest.prototype.open = openReplacement;

async function calculateShipping(cartJson) {
   const currCartAmount = await getTotalCartValue();
   updateFreeShippingBar(goalAmount, currCartAmount);
}
