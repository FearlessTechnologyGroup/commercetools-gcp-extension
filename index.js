// Get a random number, see
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Super-cool custom business rules would go here.
 * We will use a Super-fake substitute by
 * randomly doing one of three things:
 *    return discount 1, return discount 2 or
 *    return null (no discount applied)
 */
const getDiscountForCart = () => {
  const DISCOUNT_CODE_1 = '5%-OFF-ALL-LINE-ITEMS';
  const DISCOUNT_CODE_2 = '$5-OFF-YOUR-CART';

  switch (getRandomInt(4)) {
    case 1: // apply discount code 1
      return {
        actions: [
          {
            action: 'addDiscountCode',
            code: DISCOUNT_CODE_1,
          }
        ]
      };
    case 2: // apply discount code 2
      return {
        actions: [
          {
            action: 'addDiscountCode',
            code: DISCOUNT_CODE_2,
          }
        ]
      };
    case 3: // apply both discounts
      return {
        actions: [
          {
            action: 'addDiscountCode',
            code: DISCOUNT_CODE_1,
          },
          {
            action: 'addDiscountCode',
            code: DISCOUNT_CODE_2,
          }
        ]
      };
    default: // don't apply any discounts
      return null;
  }
}

/**
 * HTTP Cloud Function to be triggered by a commercetools Extension.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.applyCartDiscount = (req, res) => {
  // req.body should contain a commercetools Input object
  // req.body.resource should contain a cart
  // in place of input validation, we will
  // 1. safely destructure req to find the cart object
  const { body } = req || {};
  const { resource } = body || {};
  const { typeId, obj: cart } = resource || {};

  if (typeId === 'cart' && cart) {
    // 2. run our custom business logic to assign a discount
    const discountAction = getDiscountForCart(cart);

    // 3. log messages can be seen in GCP's Log Explorer
    console.log(JSON.stringify(discountAction));

    // 4. respond with a discount action
    if (!discountAction) {
      res.status(200).end(); // no discount to apply
    } else {
      res.status(200).json(discountAction); // apply the discount
    }
  } else { // we don't have a cart object
    res.status(400).json({
      errors: [{
        code: 'InvalidInput',
        message: 'Cart object not found.',
      }]
    });
  }
};
