/* src/pages/admin/TablesPage.jsx */
import CrudPage from "./CrudPage";
import { crud } from "../../api/api";

const schema = { number:0, capacity:4 };

export default () =>
  <CrudPage resource={{ name:"mesas", api:crud.tables, schema }} />;
