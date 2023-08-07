import { useLoaderData } from "react-router-dom";
import { getMenu } from "../../services/apiRestaurant";

function Menu() {
  // custom hook to provide loader func to menu
  const menu = useLoaderData();
  console.log(menu);
  return <h1>Menu</h1>;
}

export async function loader() {
  const menu = await getMenu();
  return menu;
}

export default Menu;
