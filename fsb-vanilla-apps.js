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

function updateProgressBar(goalAmount, cartAmount) {
  const newBarWidth = cartAmount / goalAmount * 100;
  progressBarWidth = `${newBarWidth > 100 ? 100 : newBarWidth}`;
  const progressBarEle = document.querySelector('.fsb-progress-bar');

  if(progressBarEle) {
    progressBarEle.style.width = `${progressBarWidth}%`;
    // $('.fsb-progress-bar').css({
    //   "width": `${progressBarWidth}%`,
    // });
  } else {
    setupProgressBar(progressBarWidth);
  }
}

function setupProgressBar(progressBarWidth) {
  const progBarEle = document.createElement('div');
  progBarEle.classList.add('fsb-progress-bar');

  let eleStyle = progBarEle.style;
  eleStyle.opacity = "1";
  eleStyle.margin = "0px";
  eleStyle.padding = "0px";
  eleStyle.left = "0px";
  eleStyle.width = `${progressBarWidth}%`;
  eleStyle.zIndex = "1000000001";
  eleStyle.position = "fixed";
  eleStyle.height = "4px";
  eleStyle.background = "linear-gradient(90deg, rgba(30,69,171,1) 0%, rgba(81,18,135,1) 34%, rgba(142,19,96,1) 69%, rgba(144,7,18,1) 100%)";

  document.body.insertBefore(progBarEle, document.body.childNodes[0]);
}

function updateFreeShippingBar(goalAmount, cartAmount) {
  const barMessage = getBarMessage(goalAmount, cartAmount);
  const freeShippingBarEle = document.querySelector('.free-shipping-bar');
  if(freeShippingBarEle) {
    freeShippingBarEle.firstChild.textContent = barMessage;
  } else {
    setupFreeShippingBar(barMessage);
  }
}

function setupFreeShippingBar(message) {
  const barContainer = document.createElement('div');
  const freeShippingBar = document.createElement('div');
  const textContainer = document.createElement('div');

  freeShippingBar.classList.add('free-shipping-bar');

  const barContainerStyle = barContainer.style;
  barContainerStyle.display = "block";
  barContainerStyle.color = "inherit";
  barContainerStyle.height = "44px";

  const fsbStyle = freeShippingBar.style;
  fsbStyle.opacity = "1";
  fsbStyle.margin = "0px"
  fsbStyle.padding = "0px";
  fsbStyle.left = "0px";
  fsbStyle.height = "auto";
  fsbStyle.width = "100%";
  fsbStyle.zIndex = "100000001";
  fsbStyle.position = "fixed";
  fsbStyle.top = "0px";

  const txtContainerStyle = textContainer.style;
  txtContainerStyle.textAlign = "center";
  txtContainerStyle.margin = "0px";
  txtContainerStyle.marginBottom = "0px";
  txtContainerStyle.padding = "12px 10px";
  txtContainerStyle.left = "0px";
  txtContainerStyle.height = "auto";
  txtContainerStyle.width = "100%";
  txtContainerStyle.boxSizing = "border-box";
  txtContainerStyle.border = "medium none";
  txtContainerStyle.backgroundColor = `${bgColor}`;
  txtContainerStyle.color = `${txtColor}`;
  txtContainerStyle.fontSize = "16px";
  txtContainerStyle.lineHeight = "20px";
  txtContainerStyle.fontFamily = "Helvetica";

  textContainer.textContent = message;
  freeShippingBar.appendChild(textContainer);
  barContainer.appendChild(freeShippingBar);

  document.body.insertBefore(barContainer, document.body.childNodes[0]);

  // $('body').prepend(`<div class="free-shipping-bar-container"><div class="free-shipping-bar"><div class="text-container">${message}</div></div></div>`);

  //  $('.free-shipping-bar-container').css({
  //   "display": 'block',
  //   "color": 'inherit',
  //   "height": '44px'
  //  });

  //  $('.free-shipping-bar').css({
  //   "opacity": "1",
  //   "margin": "0px",
  //   "padding": "0px",
  //   "left": "0px",
  //   "height": "auto",
  //   "width": "100%",
  //   "z-index": "100000001",
  //   "position": "fixed",
  //   "top": "0px",
  //  });

  //  $('.free-shipping-bar .text-container').css({
  //   "text-align": "center",
  //   "margin": "0px",
  //   "margin-bottom": "0px",
  //   "padding": "12px 10px",
  //   "left": "0px",
  //   "height": "auto",
  //   "width": "100%",
  //   "box-sizing": "border-box",
  //   "border": "medium none",
  //   "background-color": `${bgColor}`,
  //   "color": `${txtColor}`,
  //   "font-size": "16px",
  //   "line-height": "20px",
  //   "font-family": "Helvetica",
  //  });

  document.querySelector('.sticky').style.top = "44px";
  //$(".sticky").css("top", "44px");
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
  const { messages, styles, settings } = data;

  if(!settings.shpBarEnabled && !settings.pgBarEnabled) {
    return;
  }

  const totalCartAmount = await getTotalCartValue();
  goalAmount = data.goalAmount;

  if(settings.pgBarEnabled) {
    updateProgressBar(goalAmount, totalCartAmount)
  }

  if(settings.shpBarEnabled) {
    initialMsgBefore = messages.initialMsgBefore;
    initialMsgAfter = messages.initialMsgAfter;
    progressMsgBefore = messages.progressMsgBefore;
    progressMsgAfter = messages.progressMsgAfter;
    goalAchievedMsg = messages.goalAchievedMsg;
    bgColor = styles.bgColor;
    txtColor = styles.txtColor;

    updateFreeShippingBar(goalAmount, totalCartAmount);
  }
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
   updateProgressBar(goalAmount, currCartAmount);
}

init();
