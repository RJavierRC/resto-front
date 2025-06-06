const API = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "/api";


function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, init = {}) {
  const opts = {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeader() },
    ...init,
  };
  const res = await fetch(API + path, opts);

  if (!res.ok) {
    const text = await res.text();
    console.error("🔴 Error detallado:", text);
    throw new Error(text || res.statusText);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;

  const text = await res.text();
  if (!text) return null;

  return JSON.parse(text);
}

/* ---------- ENDPOINTS ---------- */
export const login         = (body) => request("/auth/login", { method:"POST", body:JSON.stringify(body) });
export const getTables     = ()     => request("/waiter/tables");
export const openTable = (tableId) => 
  request(`/waiter/tables/${tableId}/open`, { method: "POST" });

export const freeTable     = (id)   => request(`/waiter/tables/${id}/free`, { method:"POST" }); 
export const addItem       = (order, prod, qty) => request(`/waiter/orders/${order}/items?productId=${prod}&qty=${qty}`, { method:"POST" });
export const closeOrder    = (order, tip = 0, pay = "CASH")   => request(`/waiter/orders/${order}/close?tip=${tip}&paymentType=${pay}`, { method:"POST" });
export const searchProducts= (q)    => request(`/products/search?q=${encodeURIComponent(q)}`);
export const resetTable = (id) =>
  request(`/waiter/tables/${id}/reset`, { method: "POST" });

export const getOrder = (id) => request(`/waiter/orders/${id}`);
export const deleteItem = (orderId, itemId) => 
  request(`/waiter/orders/${orderId}/items/${itemId}`, {method: "DELETE"});

/* CRUD genérico */
const crudOf = (path) => ({
  list:   ()            => request(`/admin/${path}`),
  create: (b)           => request(`/admin/${path}`,      { method:"POST", body:JSON.stringify(b) }),
  update: (id, b)       => request(`/admin/${path}/${id}`,{ method:"PUT",  body:JSON.stringify(b) }),
  remove: (id)          => request(`/admin/${path}/${id}`,{ method:"DELETE" }),
});
export const crud = {
  users:    crudOf("users"),
  products: crudOf("products"),
  tables:   crudOf("tables"),
};

// --- Wrappers específicos para «Usuarios» ---
export const getUsers = crud.users.list;
export const createUser = crud.users.create;
export const updateUser = crud.users.update;
export const deleteUser = crud.users.remove;
