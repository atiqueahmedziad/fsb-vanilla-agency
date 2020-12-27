let goalAmount = 0;
let bgColor = "";
let txtColor = "";
let initialMsgBefore = "";
let initialMsgAfter = "";
let progressMsgBefore = "";
let progressMsgAfter = "";
let goalAchievedMsg = "";
let progressBarWidth = "0";

function valWithDecimal(val) {
  const valStr = val.toString();
  return valStr.slice(0, valStr.length-2) + "." + valStr.slice(valStr.length-2);
}

function getBarMessage(goalAmount, cartAmount) {
  goalAmount = parseFloat(goalAmount);
  cartAmount = parseFloat(cartAmount);

  if(cartAmount === 0) {
    return `${initialMsgBefore} $${goalAmount} ${initialMsgAfter}`;
  } else if(goalAmount > cartAmount) {
    return `${progressMsgBefore} $${goalAmount-cartAmount} ${progressMsgAfter}`;
  } else if(goalAmount <= cartAmount) {
    return `${goalAchievedMsg}`;
  }
}

function updateFreeShippingBar(goalAmount, cartAmount) {
  const barMessage = getBarMessage(goalAmount, cartAmount);
  progressBarWidth = `${cartAmount / goalAmount * 100}`;

  $('.fsb-progress-bar').css({
    "width": `${progressBarWidth}%`,
  });

  if($('.free-shipping-bar').length) {
    $('.free-shipping-bar .text-container').text(barMessage);
  } else {
    setupFreeShippingBar(barMessage);
  }
}

function setupFreeShippingBar(message) {
   $('header').prepend(`<div class="free-shipping-bar-container"><div class="free-shipping-bar"><div class="text-container">${message}</div></div></div><div class="fsb-progress-bar"></div>`);

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
    "background-color": `${bgColor}`,
    "color": `${txtColor}`,
    "font-size": "16px",
    "line-height": "20px",
    "font-family": "Helvetica",
   });

   $('.fsb-progress-bar').css({
    "opacity": "1",
    "margin": "0px",
    "padding": "0px",
    "left": "0px",
    "width": `${progressBarWidth}%`,
    "z-index": "1000000001",
    "position": "fixed",
    "height": "4px",
    "background": "linear-gradient(90deg, rgba(30,69,171,1) 0%, rgba(81,18,135,1) 34%, rgba(142,19,96,1) 69%, rgba(144,7,18,1) 100%)",
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

const init = async () => {
  const dataBody = await fetch('https://fsb.vanilla-apps.com/api/getgoalamount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "shopId": `${window.location.host}`,
    }),
  });

  const data = await dataBody.json();
  goalAmount = data.goalAmount;

  const { messages, styles } = data;

  initialMsgBefore = messages.initialMsgBefore;
  initialMsgAfter = messages.initialMsgAfter;
  progressMsgBefore = messages.progressMsgBefore;
  progressMsgAfter = messages.progressMsgAfter;
  bgColor = styles.bgColor;
  txtColor = styles.txtColor;

  const totalCartAmount = await getTotalCartValue();
  updateFreeShippingBar(goalAmount, totalCartAmount);
}

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

init();
