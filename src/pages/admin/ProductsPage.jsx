/* src/pages/admin/ProductsPage.jsx */
import CrudPage from "./CrudPage";
import { crud } from "../../api/api";

const schema = { name:"", category:"", price:0, enabled:true };

export default () =>
  <CrudPage resource={{ name:"productos", api:crud.products, schema }} />;
