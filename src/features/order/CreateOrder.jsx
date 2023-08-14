import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import Button from './Button';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import EmptyCart from '../cart/EmptyCart';
import store from '../../store';
import { formatCurrency } from '../../utils/helpers';
import { useState } from 'react';
import { fetchAddress } from '../user/userSlice';

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totlaPrice = totalCartPrice + priorityPrice;
  const {
    username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector((state) => state.user);
  const isLoadingAddres = addressStatus === 'loading';
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const dispatch = useDispatch();

  // when we subbmit form with error in phone number
  //here we need to show action of error
  // by using useActionData()
  const formErrors = useActionData();

  const cart = useSelector(getCart);
  console.log(cart);
  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Let's go!</h2>

      {/* <Form method="POST" action="/order/new">*/}
      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow "
            defaultValue={username}
            type="text"
            name="customer"
            required
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full " type="tel" name="phone" required />
            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              disabled={isLoadingAddres}
              defaultValue={address}
              className="input w-full"
              type="text"
              name="address"
              required
            />
            {addressStatus === 'error' && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {errorAddress}
              </p>
            )}
          </div>
          {!position.latitude && !position.longitude && (
            <span className="absolute right-[2px] top-[3px]  z-50 md:right-[5px] md:top-[5px]">
              <Button
                disabled={isLoadingAddres}
                type="small"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                {isLoadingAddres ? 'Loading Address' : 'Get Postition'}
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            type="checkbox"
            name="priority"
            id="priority"
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label className="font-medium" htmlFor="priority">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <input
            type="hidden"
            name="position"
            value={
              position.latitude && position.longitude
                ? `${position.latitude} , ${position.longitude}`
                : ''
            }
          />

          <Button disabled={isSubmitting || isLoadingAddres} type="primary">
            {isSubmitting
              ? 'Placing Order...'
              : `Order Now from ${formatCurrency(totlaPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

//param request here is request when i submit Form up to here as soon as i connected with react
export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === 'true',
  };
  console.log(order);

  const errors = {};
  if (!isValidPhone(order.phone)) errors.phone = 'Invalid Phone Number';

  if (Object.keys(errors).length > 0) return errors;
  console.log(errors);
  const newOrder = await createOrder(order);

  // dont overuse
  store.dispatch(clearCart());
  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
