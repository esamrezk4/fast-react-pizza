import { useDispatch, useSelector } from 'react-redux';
import Button from '../order/Button';
import {
  decreaseItemQuantity,
  getCurrentQuantityById,
  increaseItemQuantity,
} from './cartSlice';

function UpdateItemQuantity({ pizzaId, currentQuantity }) {
  //   const currentQuantity = useSelector(getCurrentQuantityById(pizzaId));
  const dispatch = useDispatch();
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Button
        type="round"
        onClick={() => dispatch(increaseItemQuantity(pizzaId))}
      >
        +
      </Button>
      <span className="text-sm font-medium">{currentQuantity}</span>
      <Button
        type="round"
        onClick={() => dispatch(decreaseItemQuantity(pizzaId))}
      >
        -
      </Button>
    </div>
  );
}

export default UpdateItemQuantity;
